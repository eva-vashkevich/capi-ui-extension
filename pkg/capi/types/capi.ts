import { SECRET } from '@shell/config/types';

import { base64Decode, base64Encode } from '@shell/utils/crypto';

const ENCODED_TRUE = base64Encode('true');
export const CAPI_PRODUCT_NAME = 'capi-turtles';

export const BLANK_CLUSTER = '_';

export const LABELS = { AUTO_IMPORT: 'cluster-api.cattle.io/rancher-auto-import' };

export const CAPI = {
  CLUSTER_CLASS: 'cluster.x-k8s.io.clusterclass',
  PROVIDER:      'operator.cluster.x-k8s.io.infrastructureprovider',
};
export const PROVIDER_TYPES = [{
  id: 'docker', label: 'Docker', description: '', icon: 'images/providers/dockerhub.svg', disabled: false, tag: '', name: 'docker', credentialsRequired: false
},
{
  id: 'aws', label: 'AWS', description: '', icon: 'images/providers/amazoneks.svg', disabled: false, tag: '', name: 'aws', credentialsRequired: true
}];

export const PROVIDERS = {
  docker: {
    name:                'docker',
    namespace:           'capd-system',
    credentialsRequired: false
  },
  aws: {
    name:                'aws',
    namespace:           'capa-system',
    credentialsRequired: true
  }
};

export const DEFAULT_SECRETS = {
  docker: {
    type:     SECRET,
    metadata: {
      namespace:    'capd-system',
      generateName: 'docker-',
    },
    data: {
      CLUSTER_TOPOLOGY:         ENCODED_TRUE,
      EXP_CLUSTER_RESOURCE_SET: ENCODED_TRUE,
      EXP_MACHINE_POOL:         ENCODED_TRUE
    }
  },
  aws: {
    type:     SECRET,
    metadata: {
      namespace:    'capa-system',
      generateName: 'aws-',
    },
    data: {
      CLUSTER_TOPOLOGY:         ENCODED_TRUE,
      EXP_CLUSTER_RESOURCE_SET: ENCODED_TRUE,
      EXP_MACHINE_POOL:         ENCODED_TRUE
    }
  }
};

export interface Provider {
  apiVersion?: String,
  kind?: String,
  metadata?: Object,
  spec?: Object

}
export interface CAPINamespace {
  apiVersion?: String,
  kind?: String,
  metadata?: Object
}