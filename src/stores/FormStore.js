import { observable, action, toJS } from 'mobx';
import omit from 'lodash.omit';
import join from 'lodash.join';


class FormStore {
	constructor(rootStore) {
	  this._rootStore = rootStore;
	}

  @action
  handleInputChange = (module, name) => (
      name ? (data => {
          if (Array.isArray(data)) {
              this.registerInput(module, name);
              if (Object.keys(data[0]).includes('_id')) {
                  this[module].content.set(name, data.map(e => e._id));
              } else {
                  this[module].content.set(name, data);
              }
          } else {
              this.registerInput(module, name);
              if (data._id) {
                  this[module].content.set(name, data._id);
              } else {
                  this[module].content.set(name, data.value);
              }
          }
      }) :
          (event => {
              const { target } = event;
              const { name } = target;
              const value = target.type === 'checkbox' ? target.checked : target.value;
              this.registerInput(module, name);
              this[module].content.set(name, value);
          })
  )

  registerInput = (target, field, value) => {
      if (value) {
          this[target].content.set(field, value);
      } else {
          if (!(target in this)) {
              this.registerTarget(target);
          }

          if (this[target].content.has(field)) {
              return;
          }
          this[target].content.set(field, '');
      }
  }

  registerTarget = (target) => {
      if (!target || this[target]) {
          return;
      }
      this[target] = observable({
          content: new Map(),
          message: new Map(),
          mainMessage: '',
          isLoading: false,
          subForms: [],
          dynamicFields: [],
          update: null,
          initials: {},
      });
  }

  processData(target) {
      return toJS(this[target].content);
  }

  clearForm(target) {
      const { content } = this[target];
      content.forEach((value, key) => content.set(key, ''));
  }

  _emptyArray = (count, arr) => {
      if (count === 0) {
          return arr;
      }

      arr.push(count);

      return this._emptyArray(count - 1, arr);
  }

  registerDynamicInput = (target, mainField, subFields, option) => {
      const fieldTarget = `${target}-dynamic`;
      if (!(target in this)) {
          this.registerTarget(target);
      }

      if (!(fieldTarget in this)) {
          this[fieldTarget] = {
          };
      }

      if (mainField in this[fieldTarget]) {
          return;
      }

      if (option.type === 'multi') {
          this[fieldTarget][mainField] = {
              fields: subFields,
              type: 'multi',
              elements: observable(this._emptyArray(option.initialCount, [])),
          };
          this[target].subForms.push(mainField);
      }
      this[target].dynamicFields.push(mainField);
  }

  processDynamicData = (target) => {
      const content = this[target].content;
      const dynamicOption = toJS(this[`${target}-dynamic`]);
      const omitFields = []; // elements will be ommitted for content

      const compositeData = Object.keys(dynamicOption).reduce((obj, dynamicField) => {
          const fieldOption = dynamicOption[dynamicField];

          if (fieldOption.type === 'multi') {
              obj[dynamicField] = fieldOption.elements.map((element, i) => {
                  return fieldOption.fields.reduce((el, field) => {
                      const dynamicSubField = join([dynamicField, i, field], '-');

                      omitFields.push(dynamicSubField);
                      el[field] = this._parseValue(content.get(dynamicSubField));

                      return el;
                  }, {});
              });
          }
          return obj;
      }, {});

      const mainContent = {
          ...omit(this._contentToObject(content), omitFields),
          ...compositeData,
      };

      return Object.keys(mainContent).reduce((data, key) => {
          if (mainContent[key] !== '') {
              data[key] = mainContent[key];
          }

          return data;
      }, {});
  };

  addDIElement = (target, field) => {
      return action(() => {
          this[`${target}-dynamic`][field].elements.push(0);
      });
  }

  _parseValue = (value) => {
      if (value instanceof Date) {
          return value.toISOString();
      } else if (value === 'true') {
          return true;
      } else if (value === 'false') {
          return false;
      }

      return value;
  }

  _contentToObject = (map) => {
      const obj = {};
      map.forEach((value, key) => {
          obj[key] = this._parseValue(value);
      });

      return obj;
  };

  _ascendElement = (map, dynamicField, field, i, length) => {
      const currentKey = join([dynamicField, i, field], '-');
      if (i !== length - 1) {
          const nextKey = join([dynamicField, i + 1, field], '-');

          map.set(currentKey, map.get(nextKey));
          this._ascendElement(map, dynamicField, field, i + 1, length);
      } else {
          map.delete(currentKey);
      }
  }

  removeDIElement = (target, dynamicField, i, length) => {
      return action(() => {
          const container = this[`${target}-dynamic`][dynamicField];
          container.elements.pop();

          container.fields.forEach((field) => {
              this._ascendElement(this[target].content, dynamicField, field, i, length);
              this._ascendElement(this[target].message, dynamicField, field, i, length);
          });
      });
  }
}

export default FormStore;