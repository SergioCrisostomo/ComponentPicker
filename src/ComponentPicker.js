"use strict"
/*
this.name = 'Component Picker';
this.version = '1.0.0';
this.author = Sergio Crisostomo
*/

class ComponentPicker {

    constructor(target, data){
        // init stuff
        this.elements = {};
        this.scrollPosition = 0;
        this.deployHTML(target, data);
        this.attach();
        this.findNearestSnap(true);
    }

	deployHTML(target, data) {
        function newElement(_tag, _class, _parent){
            var _el = document.createElement(_tag);
            if (_class) _el.className = _class;
            return _parent.appendChild(_el);
        }
		this.wrapper = newElement('div', 'component-picker', target);
		var ol = newElement('ol', null, this.wrapper);
        newElement('div', 'fader', this.wrapper);
        newElement('div', 'chosen', this.wrapper);

		if (typeof data == 'string'){
			var range = data.split('-').map(Number);
			data = [];
            while (range[0] <= range[1]) data.push(range[0]++);
		}

		data.forEach(function(option) {
			newElement('li', null, ol).innerHTML = option;
		});
        this.elements.scroller = ol;
		this.startEl = ol.firstElementChild;
		this.snapHeight = ol.firstElementChild.getBoundingClientRect().height;
        this.maxScrollLength = ol.children.length * this.snapHeight
		this.snapAdjust = parseInt(window.getComputedStyle(this.startEl).borderWidth) * 2;
	}

	attach() {
        this.hasScroll = 'ontouchstart' in document ? false : 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
        var handlers = {
            onclick: ['click'],
            scrollStart: ['ontouchstart' in document ? 'touchstart' : 'mousedown'],
            onscroll: ['ontouchmove' in document ? 'touchmove' : 'mousemove', this.hasScroll],
            scrollStop: ['ontouchend' in document ? 'touchend' : 'mouseup', 'onmouseleave' in document ? 'mouseleave' : false]
        };
        var self = this;

        Object.keys(handlers).forEach(function(fn){
            handlers[fn].filter(Boolean).forEach(function(ev){
                self.elements.scroller.addEventListener(ev, self[fn].bind(self));
            });
        });
	}

    // normalize wheel direction
    wheelValue(event) {
        var normalized;
        if (event.wheelDelta) {
            normalized = (event.wheelDelta % 120 - 0) == -0 ? event.wheelDelta / 120 : event.wheelDelta / 12;
        } else {
            var rawAmmount = event.deltaY ? event.deltaY : event.detail;
            normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
        }
        return normalized;
    }

	getElementIndex(hint){
		var index;
		var elements = this.elements.scroller.children;
		for (var i = 0; i < elements.length; i++){
			if (typeof hint == 'string' && elements[i].innerHTML != hint) continue;
			else if (elements[i] != hint) continue;
			index = i;
			break;
		}
		return index;
	}

    getPointerCoordinates(e) {
        return {
            x: e.pageX || e.originalEvent.touches[0].pageX,
            y: e.pageY || e.originalEvent.touches[0].pageY
		};
	}

    onclick(e) {
		if (e.target.tagName.toLowerCase() != 'li') return;
		var index = this.getElementIndex(e.target);
		var currentPosition = this.getPointerCoordinates(e);
		this.scrollPosition = ((index-1) * -this.snapHeight);
		this.startEl.style.marginTop = this.scrollPosition + 'px';
		this.scrollStop(e);
	}

    onscroll(e) {
        var isScroll = e.type.indexOf('move') == -1;
        if (!this.pointerdown && !isScroll) return;
        if (!this.lastPosition) this.lastPosition = this.pointerdown;
        e.preventDefault();
        var currentPosition = this.getPointerCoordinates(e);

        if (isScroll){
            var direction = this.wheelValue(e);
            this.scrollPosition = (this.snapHeight * (4 / 3) * direction) + parseInt( this.startEl.style.marginTop, 10);
        } else {
            this.scrollPosition = currentPosition.y - this.pointerdown.y + this.scrollStartPosition;
            var direction = currentPosition.y - (this.lastPosition.y || this.pointerdown.y);
        }
        if (this.scrollPosition > 0 && direction > 0) this.scrollPosition = this.snapHeight * (4 / 3);
        else if (this.scrollPosition - (this.snapHeight * 2) < -this.maxScrollLength) this.scrollPosition = -this.maxScrollLength + (1.8 * this.snapHeight);
        this.startEl.style.marginTop = this.scrollPosition + 'px';
        this.lastPosition = currentPosition;
        if (isScroll) this.findNearestSnap();
	}

    scrollStart(e) {
        this.pointerdown = this.getPointerCoordinates(e);
        this.scrollStartPosition = parseInt(this.startEl.style.marginTop || 0, 10);
	}

    scrollStop(e) {
        if (!this.pointerdown && e.type != 'click') return;
        this.findNearestSnap();
        this.pointerdown = false;
	}

	findNearestSnap(internal) {
        var nearest = Math.round(this.scrollPosition / this.snapHeight);
        var final = (this.snapHeight * nearest) + this.snapAdjust;
		this.startEl.style.marginTop = final + 'px';
		var index = Math.abs((nearest - 1) * -1); // to avoid having "-0"
        if (index > this.elements.scroller.children.length) return;
		if(index == this.selectedIndex) return;
		this.selectedIndex = index;
		if (this.callback && !internal) this._callback(index);
	}

	_callback(index){
		var elements = this.elements.scroller.children;
		this.callback.call(this, elements[index].innerHTML, index);
	}

	onChange(callback){
		this.callback = callback;
		return this;
	}

    getValue(){
        var elements = this.elements.scroller.children;
        return elements[this.selectedIndex].innerHTML;
    }

	setValue(newValue){
		var index = this.getElementIndex(newValue);
		if (typeof index == 'undefined') return false;
		this.scrollPosition = -(index-1) * this.snapHeight;
		this.startEl.style.marginTop = this.scrollPosition + 'px';
		this.findNearestSnap(true);
	}
}

//TODO: separate this into another file/module ?
function DatePicker (target, data) {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'date-picker';
    target.appendChild(this.wrapper);
    this.pickers = data.map(component=>{
        return new ComponentPicker(target, component)
    });
    return this;
}

DatePicker.prototype.today = function(){
    var now = new Date();
    var dateComponents = [now.getFullYear(), now.getMonth() + 1, now.getDate()];
    this.setValue(dateComponents);
}
DatePicker.prototype.getValue = function(){
    return this.pickers.map(picker=>{
        return picker.getValue();
    });
}
DatePicker.prototype.setValue = function(vals){
    return this.pickers.map((pickers, i)=>{
        return picker.setValue(vals, i);
    });
}
DatePicker.prototype.onChange = function(callback){
    var self = this;
    function commonCallback(){
        var values = self.pickers.map(picker=>{
            return picker.value;
        });
        var indexes = self.pickers.map(picker=>{
            return picker.index;
        });
        callback.call(self, values, indexes);
    }
    this.pickers.forEach(picker=>{
        picker.onChange(commonCallback)
    });
}
