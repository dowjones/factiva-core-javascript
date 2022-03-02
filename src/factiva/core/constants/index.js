/**
 *  @module factiva/core/constants
 */

import analytics from './analytics';
import apistates from './apistates';
import dowjones from './dowjones';
import errors from './errors';
import snapshots from './snapshots';
import streams from './streams';
import request from './request';
import listener from './listener';

/** Constants used on the project */
module.exports = {
  ...analytics,
  ...apistates,
  ...dowjones,
  ...errors,
  ...snapshots,
  ...streams,
  ...request,
  ...listener,
};
