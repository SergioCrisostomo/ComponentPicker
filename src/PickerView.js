
var PickerView = function(target, data) {
	var picker = {};
    picker.name = 'PickerView';

	picker.deployHTML = function(target) {
		picker.elements = {};
		picker.wrapper = document.createElement('div');
		picker.wrapper.classList.add('component-picker');
		target.appendChild(picker.wrapper);
		picker.elements.wrapper = {
			el: picker.wrapper,
			children: {}
		};
		
		var ol = document.createElement('ol');
		var fader = document.createElement('div');
		fader.classList.add('fader');
		var chosen = document.createElement('div');
		chosen.classList.add('chosen');
		
		picker.wrapper.appendChild(ol);
		picker.wrapper.appendChild(fader);
		picker.wrapper.appendChild(chosen);
		picker.elements.wrapper.children.fader = fader;
		picker.elements.wrapper.children.scroller = ol;
		
		if (typeof data == 'string'){
			var range = data.split('-').map(Number);
			data = [];
			for (var i = range[0]; i <= range[1]; i++){
				data.push(i);
			}
		}
		
		data.forEach(function(option) {
			var li = document.createElement('li');
			li.innerHTML = option;
			ol.appendChild(li);
		});

		picker.maxScrollLength = ol.scrollHeight;
		picker.scrollPosition = 0;
		picker.scrollEl = ol.firstElementChild;
		picker.snapHeight = ol.firstElementChild.getBoundingClientRect().height;
		picker.snapAdjust = parseInt(window.getComputedStyle(picker.scrollEl).borderWidth) * 2;
	}

	picker.attach = function() {
        var _down = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
        var _move = 'ontouchmove' in window ? 'touchmove' : 'mousemove';
        var _up = 'ontouchend' in window ? 'touchend' : 'mouseup';
        var scroller = picker.elements.wrapper.children.scroller;
		
        scroller.addEventListener('click', picker.onclick);
        scroller.addEventListener(_down, picker.scrollStart.bind(picker));
        scroller.addEventListener(_move, picker.onscroll.bind(picker));
        // touchleave was never implemented, so we just use mouseleave
        scroller.addEventListener('mouseleave', picker.scrollStop.bind(picker));
        window.addEventListener(_up, picker.scrollStop.bind(picker));
	}

	picker.getElementIndex = function(hint){
		var index;
		var elements = picker.elements.wrapper.children.scroller.children;
		for (var i = 0; i < elements.length; i++){
			if (typeof hint == 'string' && elements[i].innerHTML != hint) continue;
			else if (elements[i] != hint) continue;
			index = i;
			break;
		}
		return index;
	}

    picker.getPointerCoordinates = function(e) {
        return {
            x: e.pageX || e.originalEvent.touches[0].pageX,
            y: e.pageY || e.originalEvent.touches[0].pageY
		};
	}

    picker.onclick = function(e) {
		if (e.target.tagName.toLowerCase() != 'li') return;
		var index = picker.getElementIndex(e.target);
		var currentPosition = picker.getPointerCoordinates(e);
		picker.scrollPosition = ((index-1) * -picker.snapHeight);
		picker.scrollEl.style.marginTop = picker.scrollPosition + 'px';
		picker.scrollStop(e);
	}

    picker.onscroll = function(e) {
        if (!picker.pointerdown) return;
        if (!picker.lastPosition) picker.lastPosition = picker.pointerdown;
        e.preventDefault();
		
        var currentPosition = picker.getPointerCoordinates(e);
        picker.scrollPosition = currentPosition.y - picker.pointerdown.y + picker.scrollStartPosition;
        var direction = currentPosition.y - (picker.lastPosition.y || picker.pointerdown.y);
        if (picker.scrollPosition > 0 && direction > 0) picker.scrollPosition = picker.snapHeight * (4 / 3);
        else if (picker.scrollPosition - (picker.snapHeight * 2) < -picker.maxScrollLength) picker.scrollPosition = -picker.maxScrollLength + (1.8 * picker.snapHeight);
        picker.scrollEl.style.marginTop = picker.scrollPosition + 'px';
        picker.lastPosition = currentPosition;
	}

    picker.scrollStart = function(e) {
        picker.pointerdown = picker.getPointerCoordinates(e);
        picker.scrollStartPosition = parseInt(picker.scrollEl.style.marginTop || 0, 10);
	}

    picker.scrollStop = function(e) {
        if (!picker.pointerdown && e.type != 'click') return;
        picker.findNearestSnap();
        picker.pointerdown = false;
	}

	picker.findNearestSnap = function(internal) {
        var nearest = Math.round(picker.scrollPosition / picker.snapHeight);
        var final = (picker.snapHeight * nearest) + picker.snapAdjust;
		picker.scrollEl.style.marginTop = final + 'px';
		var index = Math.abs((nearest - 1) * -1); // to avoid having "-0"
		if(index == picker.selectedIndex) return;
		picker.selectedIndex = index;
		if (picker.callback && !internal) picker._callback(index);
	}

	picker._callback = function(index){
		var elements = picker.elements.wrapper.children.scroller.children;
		picker.callback.call(picker, elements[index].innerHTML, index);
	}

	// public mehtods from here down

	this.onChange = function(callback){
		picker.callback = callback;
		return this;
	}

	this.value = function(newValue){
		var elements = picker.elements.wrapper.children.scroller.children;
		if (typeof newValue == 'undefined') return elements[picker.selectedIndex].innerHTML;
		
		var index = picker.getElementIndex(newValue);
		if (typeof index == 'undefined') return false;
		picker.scrollPosition = -(index-1) * picker.snapHeight;
		picker.scrollEl.style.marginTop = picker.scrollPosition + 'px';
		picker.findNearestSnap(true);
	}

	// init stuff
	picker.deployHTML(target);
	picker.attach();
	picker.findNearestSnap(true);
	return this;
}
