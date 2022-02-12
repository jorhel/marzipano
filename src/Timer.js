/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

import eventEmitter from "minimal-event-emitter";
import defaults from "./util/defaults";
import now from "./util/now";

var defaultOptions = {
  duration: Infinity
};


/**
 * Signals a timeout.
 * @event Timer#timeout
 */


/**
 * @class Timer
 * @classdesc
 *
 * A Timer provides a mechanism to receive an event after a timeout.
 *
 * A timer has a set duration, and is either started or stopped at a given time.
 * The timer is initially stopped. When the timer is started, a timeout event is
 * scheduled to fire once the set duration elapses. When the timer is stopped,
 * the scheduled timeout event is cancelled. When a timeout event fires, the
 * timer returns to the stopped state.
 *
 * @param {number} [opts.duration=Infinity] Timeout in milliseconds.
 */
class Timer {
  constructor(opts) {

    opts = defaults(opts || {}, defaultOptions);

    this._duration = opts.duration;

    this._startTime = null;

    this._handle = null;

    this._check = this._check.bind(this);

  }
  /**
   * Starts the timer. If the timer is already started, this has the effect of
   * stopping and starting again (i.e. resetting the timer).
   */
  start() {
    this._startTime = now();
    if (this._handle == null && this._duration < Infinity) {
      this._setup(this._duration);
    }
  }
  /**
   * Returns whether the timer is in the started state.
   * @return {boolean}
   */
  started() {
    return this._startTime != null;
  }
  /**
   * Stops the timer.
   */
  stop() {
    this._startTime = null;
    if (this._handle != null) {
      clearTimeout(this._handle);
      this._handle = null;
    }
  }
  _setup(interval) {
    this._handle = setTimeout(this._check, interval);
  }
  _teardown() {
    clearTimeout(this._handle);
    this._handle = null;
  }
  /**
   * Returns the currently set duration.
   */
  duration() {
    return this._duration;
  }
  /**
   * Sets the duration. If the timer is already started, the timeout event is
   * rescheduled to occur once the new duration has elapsed since the last call
   * to start. In particular, if an amount of time larger than the new duration
   * has already elapsed, the timeout event fires immediately.
   * @param {number}
   */
  setDuration(duration) {
    this._duration = duration;
    if (this._startTime != null) {
      this._check();
    }
  }
}

eventEmitter(Timer);

Timer.prototype._check = function() {
  var currentTime = now();
  var elapsed = currentTime - this._startTime;
  var remaining = this._duration - elapsed;

  this._teardown();

  if (remaining <= 0) {
    this.emit('timeout');
    this._startTime = null;
  } else if (remaining < Infinity) {
    this._setup(remaining);
  }
};


export default Timer;
