/**
 *  @module factiva/core/StreamResponse
 */

/**
 * Extract Object
 * @typedef {Object} StreamResponseOptions
 * @type {object}
 * @property {string} type - Stream type
 * @property {string} id - Stream id
 * @property {object} attributes - Format
 * @property {object} relationships  - Stream relationships
 * @property {object} [links={}] - Links
 */

/** Class used to get create a StreamResponse object */
class StreamResponse {
  /** Constructor
   * @param {StreamResponseOptions} options - Stream option obtained by the API
   */
  constructor({ type, id, attributes, relationships, links = {} }) {
    this.type = type;
    this.id = id;
    this.attributes = this.setData(attributes);
    this.relationships = this.setData(relationships);
    this.links = links ? this.setData(links) : '';
  }

  /**
   *
   * @param {object} data - Object to be parsed in string
   * @param {number} level - Level of indentation to respect
   * @returns {string} Object parsed as string
   */
  setData(data, level = 2) {
    const idents = new Array(level + 1).join(' ');
    let objectRepr = '';
    Object.entries(data).forEach(([key, val]) => {
      if (val.isArray) {
        // eslint-disable-next-line no-restricted-syntax
        for (const att of val) {
          const currData = this.setData(att, level + 1);
          objectRepr += `${idents}${key}: \n ${currData}     ---\n`;
        }
      } else if (typeof val === 'object') {
        const currData = this.setData(val, level + 1);
        objectRepr += `${idents}${key}: \n ${currData}       ---\n`;
      } else {
        objectRepr += `${idents}${key}: ${val}      ---\n`;
      }
    });

    return objectRepr;
  }

  /**
   * Convert the StreamResponse in string
   * @returns {string} String representation of a StreamResponse
   */
  toString() {
    return `StreamResponse(
      type: ${this.type},
      id: ${this.id},
      attributes:
          ${this.attributes},
      relationships:
          ${this.relationships},
      links:
          ${this.links},
    )`;
  }
}
/** Module to build a StreamResponse object */
module.exports = StreamResponse;
