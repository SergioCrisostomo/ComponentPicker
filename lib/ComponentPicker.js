"use strict";

/* Component Picker */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function newElement(_tag, _class, _parent) {
    var _el = document.createElement(_tag);
    if (_class) _el.className = _class;
    return _parent.appendChild(_el);
}

var ComponentPicker = function () {
    function ComponentPicker(target, data) {
        _classCallCheck(this, ComponentPicker);

        // init stuff
        this.elements = {};
        this.scrollPosition = 0;
        this.deployHTML(target, data);
        this.attach();
        this.findNearestSnap(true);
    }

    _createClass(ComponentPicker, [{
        key: 'deployHTML',
        value: function deployHTML(target, data) {

            if (typeof data == 'string') {
                var range = data.split('-').map(Number);
                data = [];
                while (range[0] <= range[1]) {
                    data.push(range[0]++);
                }
            }

            this.wrapper = newElement('div', 'component-picker', target);
            var ol = newElement('ol', null, this.wrapper);
            newElement('div', 'fader', this.wrapper);
            newElement('div', 'chosen', this.wrapper);

            data.forEach(function (option) {
                newElement('li', null, ol).innerHTML = option;
            });
            this.elements.scroller = ol;
            this.startEl = ol.firstElementChild;
            this.snapHeight = ol.firstElementChild.getBoundingClientRect().height;
            this.maxScrollLength = ol.children.length * this.snapHeight;
            this.snapAdjust = parseInt(window.getComputedStyle(this.startEl).borderWidth) * 2;
        }
    }, {
        key: 'attach',
        value: function attach() {
            var _this = this;

            this.hasScroll = 'ontouchstart' in document ? false : 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
            var handlers = {
                onclick: ['click'],
                scrollStart: ['ontouchstart' in document ? 'touchstart' : 'mousedown'],
                onscroll: ['ontouchmove' in document ? 'touchmove' : 'mousemove', this.hasScroll],
                scrollStop: ['ontouchend' in document ? 'touchend' : 'mouseup', 'onmouseleave' in document ? 'mouseleave' : false]
            };

            Object.keys(handlers).forEach(function (fn) {
                handlers[fn].filter(Boolean).forEach(function (ev) {
                    _this.elements.scroller.addEventListener(ev, _this[fn].bind(_this));
                });
            });
        }

        // normalize wheel direction

    }, {
        key: 'wheelValue',
        value: function wheelValue(event) {
            var normalized;
            if (event.wheelDelta) {
                normalized = event.wheelDelta % 120 - 0 == -0 ? event.wheelDelta / 120 : event.wheelDelta / 12;
            } else {
                var rawAmmount = event.deltaY ? event.deltaY : event.detail;
                normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
            }
            return normalized;
        }
    }, {
        key: 'getElementIndex',
        value: function getElementIndex(hint) {
            var index;
            if (!hint) hint = this.getValue();
            var elements = this.elements.scroller.children;
            for (var i = 0; i < elements.length; i++) {
                index = i;
                if (typeof hint == 'string' && elements[i].innerHTML == hint) break;else if (elements[i] == hint) break;
            }
            return index;
        }
    }, {
        key: 'getPointerCoordinates',
        value: function getPointerCoordinates(e) {
            return {
                x: e.pageX || e.originalEvent.touches[0].pageX,
                y: e.pageY || e.originalEvent.touches[0].pageY
            };
        }
    }, {
        key: 'onclick',
        value: function onclick(e) {
            if (e.target.tagName.toLowerCase() != 'li') return;
            var index = this.getElementIndex(e.target);
            var currentPosition = this.getPointerCoordinates(e);
            this.scrollPosition = (index - 1) * -this.snapHeight;
            this.startEl.style.marginTop = this.scrollPosition + 'px';
            this.scrollStop(e);
        }
    }, {
        key: 'onscroll',
        value: function onscroll(e) {
            e.preventDefault();

            var isScroll = e.type.indexOf('move') == -1;
            if (!this.pointerdown && !isScroll) return;
            if (!this.lastPosition) this.lastPosition = this.pointerdown;
            var currentPosition = this.getPointerCoordinates(e);

            var direction;
            if (isScroll) {
                direction = this.wheelValue(e);
                this.scrollPosition = this.snapHeight * (4 / 3) * direction + parseInt(this.startEl.style.marginTop, 10);
            } else {
                this.scrollPosition = currentPosition.y - this.pointerdown.y + this.scrollStartPosition;
                direction = currentPosition.y - (this.lastPosition.y || this.pointerdown.y);
            }
            if (this.scrollPosition > 0 && direction > 0) this.scrollPosition = this.snapHeight * (4 / 3);else if (this.scrollPosition - this.snapHeight * 2 < -this.maxScrollLength) this.scrollPosition = -this.maxScrollLength + 1.8 * this.snapHeight;
            this.startEl.style.marginTop = this.scrollPosition + 'px';
            this.lastPosition = currentPosition;
            if (isScroll) this.findNearestSnap();
        }
    }, {
        key: 'scrollStart',
        value: function scrollStart(e) {
            this.pointerdown = this.getPointerCoordinates(e);
            this.scrollStartPosition = parseInt(this.startEl.style.marginTop || 0, 10);
        }
    }, {
        key: 'scrollStop',
        value: function scrollStop(e) {
            if (!this.pointerdown && e.type != 'click') return;
            this.findNearestSnap();
            this.pointerdown = false;
        }
    }, {
        key: 'findNearestSnap',
        value: function findNearestSnap(internal) {
            var nearest = Math.round(this.scrollPosition / this.snapHeight);
            var final = this.snapHeight * nearest + this.snapAdjust;
            this.startEl.style.marginTop = final + 'px';
            var index = Math.abs((nearest - 1) * -1); // to avoid having "-0"
            if (index > this.elements.scroller.children.length) return;
            if (index == this.selectedIndex) return;
            this.selectedIndex = index;
            if (this.callback && !internal) this._callback(index);
        }
    }, {
        key: '_callback',
        value: function _callback(index) {
            var elements = this.elements.scroller.children;
            this.callback.call(this, elements[index].innerHTML, index);
        }
    }, {
        key: 'onChange',
        value: function onChange(callback) {
            this.callback = callback;
            return this;
        }
    }, {
        key: 'getValue',
        value: function getValue() {
            var elements = this.elements.scroller.children;
            return elements[this.selectedIndex].innerHTML;
        }
    }, {
        key: 'setValue',
        value: function setValue(newValue) {
            var index = this.getElementIndex(newValue);
            if (typeof index == 'undefined') return false;
            this.scrollPosition = -(index - 1) * this.snapHeight;
            this.startEl.style.marginTop = this.scrollPosition + 'px';
            this.findNearestSnap(true);
        }
    }]);

    return ComponentPicker;
}();

var DatePicker = function () {
    function DatePicker(target, data) {
        _classCallCheck(this, DatePicker);

        this.wrapper = newElement('div', 'date-picker', target);
        this.pickers = data.map(function (component) {
            return new ComponentPicker(target, component);
        });
    }

    _createClass(DatePicker, [{
        key: 'today',
        value: function today() {
            var now = new Date();
            var dateComponents = [now.getFullYear(), now.getMonth() + 1, now.getDate()];
            this.setValue(dateComponents);
        }
    }, {
        key: 'getValue',
        value: function getValue() {
            return this.pickers.map(function (picker) {
                return picker.getValue();
            });
        }
    }, {
        key: 'setValue',
        value: function setValue(vals) {
            return this.pickers.map(function (picker, i) {
                return picker.setValue(vals, i);
            });
        }
    }, {
        key: 'onChange',
        value: function onChange(callback) {
            var self = this;
            function commonCallback() {
                var indexes = self.pickers.map(function (picker) {
                    return picker.getElementIndex();
                });
                callback.call(self, self.getValue(), indexes);
            }
            this.pickers.forEach(function (picker) {
                picker.onChange(commonCallback);
            });
        }
    }]);

    return DatePicker;
}();