import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import difference from 'lodash/difference';

export const hasOnly = (obj: object, props: string[]) => isEmpty(difference(keys(obj), props));
