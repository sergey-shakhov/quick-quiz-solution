import path from 'path';
import { Schema } from 'yup';
import { readFile } from 'fs/promises';
import map from 'lodash/map';
import uniq from 'lodash/uniq';
import get from 'lodash/get';

import yaml from 'js-yaml';
import { BaseError } from '../../app.web.common';

class SectionNotFoundError extends BaseError {
  constructor(sectionId: string) {
    super(`Section ${sectionId} not found.`);
  }
}

type ConfigurationSectionEntry = {
  sectionId: string;
  fileName: string;
  sectionName?: string;
  schema: Schema;
  configurationObject: object | undefined;
};

class Configuration {
  private entries: ConfigurationSectionEntry[] = [];

  constructor(private defaultConfigurationFileName: string, private baseConfigurationDirectory: string) {
  }

  registerSection(sectionId: string, schema: Schema, fileName: string = this.defaultConfigurationFileName, sectionName?: string): void {
    this.entries.push({
      sectionId, 
      fileName,
      sectionName,
      schema,
      configurationObject: undefined,
    });
  }

  async load() {
    const fileNames = uniq(map(this.entries, (entry) => entry.fileName));
    for (let i = 0; i < fileNames.length; i++) {
      const fileName = fileNames[i];
      const yamlAsString = await readFile(path.join(this.baseConfigurationDirectory, fileName), 'utf-8');
      const yamlAsObject = yaml.load(yamlAsString);

      const matchingEntries = this.entries.filter((entry) => entry.fileName === fileName);
      for (let j = 0; j < matchingEntries.length; j++) {
        const entry = matchingEntries[j];
        const objectToValidate = entry.sectionName ? get(yamlAsObject, entry.sectionName) : yamlAsObject;
        const validatedObject = await entry.schema.validate(objectToValidate, { strict: true });
        entry.configurationObject = validatedObject;
      }
    }
  }

  get<TSection>(sectionId: string) {
    const entry = this.entries.find((entry) => entry.sectionId === sectionId);
    if (!entry) {
      throw new SectionNotFoundError(sectionId);
    }
    return entry.configurationObject as TSection; 
  }

}

export {
  Configuration,
};


