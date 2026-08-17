"""
EstimateBuilder — porta a classe EstimateBuilder do JavaScript para Python.

Constrói estimativas compatíveis com a AWS Pricing Calculator save API.
"""

import uuid
import re
from datetime import datetime, timezone

from tools.aws_calculator_client import (
    load_manifest,
    find_service,
    fetch_service_definition,
    save_estimate,
    extract_input_fields,
    resolve_partition,
    PARTITIONS,
)

# Mapeamento de region codes para nomes legíveis
REGIONS = {
    'us-east-1': 'US East (N. Virginia)',
    'us-east-2': 'US East (Ohio)',
    'us-west-1': 'US West (N. California)',
    'us-west-2': 'US West (Oregon)',
    'ca-central-1': 'Canada (Central)',
    'sa-east-1': 'South America (Sao Paulo)',
    'eu-west-1': 'Europe (Ireland)',
    'eu-west-2': 'Europe (London)',
    'eu-west-3': 'Europe (Paris)',
    'eu-central-1': 'Europe (Frankfurt)',
    'eu-north-1': 'Europe (Stockholm)',
    'eu-south-1': 'Europe (Milan)',
    'ap-southeast-1': 'Asia Pacific (Singapore)',
    'ap-southeast-2': 'Asia Pacific (Sydney)',
    'ap-northeast-1': 'Asia Pacific (Tokyo)',
    'ap-northeast-2': 'Asia Pacific (Seoul)',
    'ap-northeast-3': 'Asia Pacific (Osaka)',
    'ap-south-1': 'Asia Pacific (Mumbai)',
    'ap-east-1': 'Asia Pacific (Hong Kong)',
    'me-south-1': 'Middle East (Bahrain)',
    'af-south-1': 'Africa (Cape Town)',
}


def _sanitize(text):
    """Remove caracteres <, >, & de um texto para evitar problemas no payload."""
    if not text or not isinstance(text, str):
        return text
    return text.replace('&', '').replace('<', '').replace('>', '')


def _wrap_values(config):
    """
    Para cada campo do config (exceto 'region' e 'description'):
    - Se o valor já é um dict, mantém como está.
    - Se é um valor simples, wrapa em {'value': str(v)}.
    """
    wrapped = {}
    skip_keys = {'region', 'description'}

    for key, value in config.items():
        if key in skip_keys:
            continue
        if isinstance(value, dict):
            wrapped[key] = value
        else:
            wrapped[key] = {'value': str(value)}

    return wrapped


class EstimateBuilder:
    """
    Constrói uma estimativa AWS Pricing Calculator.

    Uso:
        builder = EstimateBuilder(name='Minha Estimativa')
        builder.add_service('AmazonEC2/us-east-1', {'region': 'us-east-1', ...})
        result = await builder.export()
        # result = {'estimateId': '...', 'shareableUrl': '...'}
    """

    def __init__(self, name='My Estimate', partition=None):
        self.id = str(uuid.uuid4())
        self.name = name
        self.partition = partition
        self.services = {}   # composite_key -> config
        self.groups = {}     # group_name -> list of composite_keys
        self.used_keys = set()

    def add_service(self, composite_key, config, group=None):
        """
        Adiciona um serviço à estimativa.

        Se a key já existe e o config possui 'description', appenda a description
        à key para torná-la única.
        """
        key = composite_key

        if key in self.used_keys:
            description = config.get('description', '')
            if description:
                # Append description à key para diferenciar
                key = f"{composite_key}/{description}"

        self.used_keys.add(key)
        self.services[key] = config

        if group:
            if group not in self.groups:
                self.groups[group] = []
            self.groups[group].append(key)

    async def to_aws_payload(self):
        """
        Constrói o payload JSON que a AWS save API espera.

        Resolve partition, monta cada serviço com manifest/definição,
        agrupa em groups, e adiciona metadata.
        """
        # Resolve partition a partir das regions dos services
        partition = self.partition
        if not partition:
            regions_used = []
            for config in self.services.values():
                region = config.get('region')
                if region:
                    regions_used.append(region)
            if regions_used:
                partition = resolve_partition(regions_used[0])
            else:
                partition = 'aws'

        manifest = await load_manifest(partition)

        # Construir serviços no formato AWS
        service_configs = []

        for composite_key, config in self.services.items():
            # Extrair serviceCode da composite_key (formato: ServiceCode/region ou ServiceCode/region/desc)
            parts = composite_key.split('/')
            service_code = parts[0] if parts else composite_key
            region = config.get('region', 'us-east-1')

            # Buscar definição do serviço no manifest
            service_info = find_service(manifest, service_code)
            if not service_info:
                continue

            definition = await fetch_service_definition(service_info, region, partition)
            if not definition:
                continue

            # Template ID (estimateFor)
            template_id = definition.get('id', '')

            # Service name e version
            service_name = service_info.get('serviceName', service_code)
            version = definition.get('version', '0.0.1')

            # Region name
            region_name = REGIONS.get(region, region)

            # Description
            description = _sanitize(config.get('description', service_name))

            # TODO: Para EC2 (key 'ec2enhancement' case-insensitive), calculationComponents
            # usa lógica especial (ec2.js). Por ora, tratamos EC2 igual aos outros services.
            # Implementar lógica EC2 específica quando necessário.

            # Calculation components (wrap values)
            calculation_components = _wrap_values(config)

            # Config summary (extrair campos de input)
            config_summary = extract_input_fields(definition, config)

            service_entry = {
                'serviceCode': service_code,
                'region': region,
                'estimateFor': template_id,
                'description': description,
                'serviceName': service_name,
                'regionName': region_name,
                'version': version,
                'calculationComponents': calculation_components,
                'configSummary': config_summary,
            }

            service_configs.append(service_entry)

        # Montar groups
        groups_payload = {}
        # Serviços sem grupo vão para o grupo padrão
        ungrouped_keys = [
            key for key in self.services.keys()
            if not any(key in keys for keys in self.groups.values())
        ]

        if ungrouped_keys or not self.groups:
            default_group_id = str(uuid.uuid4())
            groups_payload[default_group_id] = {
                'name': self.name,
                'services': [],
            }

        for group_name, keys in self.groups.items():
            group_id = str(uuid.uuid4())
            groups_payload[group_id] = {
                'name': group_name,
                'services': [],
            }

        # Associar services aos groups
        service_index = 0
        key_to_index = {}
        for key in self.services.keys():
            key_to_index[key] = service_index
            service_index += 1

        for group_id, group_data in groups_payload.items():
            group_name = group_data['name']
            if group_name in self.groups:
                for key in self.groups[group_name]:
                    idx = key_to_index.get(key)
                    if idx is not None and idx < len(service_configs):
                        group_data['services'].append(service_configs[idx])
            elif group_name == self.name:
                # Grupo padrão: serviços sem grupo
                for key in ungrouped_keys:
                    idx = key_to_index.get(key)
                    if idx is not None and idx < len(service_configs):
                        group_data['services'].append(service_configs[idx])

        # Metadata
        metadata = {
            'locale': 'en_US',
            'currency': 'USD',
            'createdOn': datetime.now(timezone.utc).isoformat(),
            'source': 'calculator-platform',
        }

        payload = {
            'id': self.id,
            'name': self.name,
            'groups': groups_payload,
            'metadata': metadata,
        }

        return payload

    async def export(self):
        """
        Exporta a estimativa: constrói o payload e salva via AWS API.

        Returns:
            dict: {'estimateId': str, 'shareableUrl': str}
        """
        payload = await self.to_aws_payload()
        result = await save_estimate(payload)
        return result
