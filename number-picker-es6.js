(
    function (root, factory) {
        if (typeof define === 'function' && define.amd) {
            define([], function () {
                return factory(root);
            });
        } else if (typeof exports === 'object') {
            module.exports = factory(root);
        } else {
            root.Picker = factory(root);
        }
    })(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function (window) {

        // Default settings
        const defaults = {
            selector: ".number-picker",
            orientation: "horizontal",
            arrowOrientation: "horizontal",
            itemsToShow: 3,
            start: 1,
            end: 10,
            length: 10,
            step: 1,
            activeIndex: 0,
            beforeChange: function () { },
            afterChange: function () { }
        };

        // Merge defaults with user options
        const extend = (target, options) => {
            let prop;
            const extended = {};
            for (prop in defaults) {
                if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                    extended[prop] = defaults[prop];
                }
            }
            for (prop in options) {
                if (Object.prototype.hasOwnProperty.call(options, prop)) {
                    extended[prop] = options[prop];
                }
            }
            return extended;
        };

        const getIndex = (el) => {
            if (!el) return -1;
            var i = 0;
            do {
                i++;
            } while ((el = el.previousElementSibling));
            return i;
        }

        // Private functions  

        // Clone and replace item
        const _cloneAndRemove = (selector, direction) => {

            const track = selector.querySelector(".picker-track");

            if (direction === 'prev') {

                const clonedItem = track.lastElementChild.cloneNode(true);

                track.insertBefore(clonedItem, track.firstChild);
                track.lastElementChild.remove();

            } else if (direction === 'next') {

                const clonedItem = track.firstElementChild.cloneNode(true);

                track.appendChild(clonedItem);
                track.firstElementChild.remove();
            }
        };

        // Move track vertical
        const _moveHorizontal = (options, direction) => {

            const track = options.selector.querySelector(".picker-track");

            const offsetLeft = parseFloat(track.style.left.match(/(-?[0-9\.]+)/g)[0]);
            const translateX = track.style.transform.match(/(-?[0-9\.]+)/g)[0];
            let newOffsetLeft;
            let newTranslateX;

            const elementWidth = options.selector.offsetWidth;
            const itemWidth = elementWidth / options.itemsToShow;

            if (direction === 'prev') {
                newOffsetLeft = offsetLeft - itemWidth;
                newTranslateX = parseFloat(translateX) + itemWidth;
            } else if (direction === 'next') {
                newOffsetLeft = offsetLeft + itemWidth;
                newTranslateX = parseFloat(translateX) - itemWidth;
            }

            track.style.left = `${newOffsetLeft}px`;
            track.style.transform = `translateX(${newTranslateX}px)`;
        };

        // Move track vertical
        const _moveVertical = (options, direction) => {

            const track = options.selector.querySelector(".picker-track");

            const offsetTop = parseFloat(track.style.top.match(/(-?[0-9\.]+)/g)[0]);
            const translateY = track.style.transform.match(/(-?[0-9\.]+)/g)[0];
            let newOffsetTop;
            let newTranslateY;

            const elementHeight = options.selector.offsetHeight;
            const itemHeight = elementHeight / options.itemsToShow;

            if (direction === 'prev') {
                newOffsetTop = offsetTop - itemHeight;
                newTranslateY = parseFloat(translateY) + itemHeight;
            } else if (direction === 'next') {
                newOffsetTop = offsetTop + itemHeight;
                newTranslateY = parseFloat(translateY) - itemHeight;
            }

            track.style.top = `${newOffsetTop}px`;
            track.style.transform = `translateY(${newTranslateY}px)`;
        };

        // Navigate picker
        const _navigate = (options, direction) => {

            options.beforeChange(options.value)

            _cloneAndRemove(options.selector, direction);

            options.orientation === 'horizontal' ? _moveHorizontal(options, direction) : _moveVertical(options, direction)

            const activeItem = options.selector.querySelector(".picker-item.active");
            activeItem.classList.remove("active");

            direction === 'prev' ? activeItem.previousElementSibling.classList.add("active") : activeItem.nextElementSibling.classList.add("active");

            options.value = options.selector.querySelector(".picker-item.active").getAttribute("data-value");

            options.afterChange(options.value)
        }

        // Add listeners
        const _addListeners = (options) => {
            options.selector.querySelector(".picker-arrow.prev").addEventListener("click", function () { _navigate(options, 'prev') });
            options.selector.querySelector(".picker-arrow.next").addEventListener("click", function () { _navigate(options, 'next') });
        }

        // Remove listeners
        const _removeListeners = (options) => {
            options.selector.querySelector(".picker-arrow.prev").removeEventListener("click", function () { });
            options.selector.querySelector(".picker-arrow.next").removeEventListener("click", function () { });
        }

        // Compose data (organize options and set one that are needed, make some calculations if they are needed
        const _composeData = (options) => {

            return {
                orientation: options.orientation,
                arrowOrientation: options.arrowOrientation,
                start: options.start,
                end: options.end ? Math.floor(options.end / options.step) * options.step : options.length * options.step,
                length: options.list ? options.list.length : options.end ? Math.floor((options.end - options.start) / options.step) + 1 : options.length,
                step: options.step,
                activeIndex: options.activeIndex,
                list: options.list,
            }
        }

        // Create items
        const _createItems = (data, size) => {

            let template1 = "";
            let template2 = "";
            let template3 = "";

            // If there is a list ignore other settings
            if (data.list) {

                for (let i = 0; i < data.length; i++) {
                    if (i < Math.ceil(data.length / 2)) {
                        template2 = template2 + `<div class="picker-item" data-value="${data.list[i]}" style="${data.orientation === "horizontal" ? "width" : "height"}:${size}px">${data.list[i]}</div>`;
                    } else {
                        template1 = template1 + `<div class="picker-item" data-value="${data.list[i]}" style="${data.orientation === "horizontal" ? "width" : "height"}:${size}px">${data.list[i]}</div>`;
                    }
                }

            } else {

                for (let i = 0; i < data.length; i++) {
                    if (Math.abs(data.activeIndex - i) < Math.ceil(data.length / 2)) {
                        template2 = template2 + `<div class="picker-item" data-value="${data.start + (i * data.step)}" style="${data.orientation === "horizontal" ? "width" : "height"}:${size}px">${data.start + (i * data.step)}</div>`;
                    } else if (-(data.activeIndex - i) === data.length / 2) {
                        template2 = template2 + `<div class="picker-item" data-value="${data.start + (i * data.step)}" style="${data.orientation === "horizontal" ? "width" : "height"}:${size}px">${data.start + (i * data.step)}</div>`;
                    } else if (data.activeIndex > i) {
                        template3 = template3 + `<div class="picker-item" data-value="${data.start + (i * data.step)}" style="${data.orientation === "horizontal" ? "width" : "height"}:${size}px">${data.start + (i * data.step)}</div>`;
                    } else {
                        template1 = template1 + `<div class="picker-item" data-value="${data.start + (i * data.step)}" style="${data.orientation === "horizontal" ? "width" : "height"}:${size}px">${data.start + (i * data.step)}</div>`
                    }
                }
            }



            return template1 + template2 + template3;
        }

        // Create HTML elements
        const _createHtmlElements = (options) => {

            const data = _composeData(options)

            let elementWidth, elementHeight, itemWidth, itemHeight;
            if (data.orientation === 'horizontal') {
                elementWidth = options.selector.offsetWidth;
                itemWidth = elementWidth / options.itemsToShow;
            } else {
                elementHeight = options.selector.offsetHeight
                itemHeight = elementHeight / options.itemsToShow;

            }

            const border = Math.floor(parseInt(options.itemsToShow) / 2);
            const pickerStartPosition = (Math.ceil(data.length / 2) - border - 1) * (data.orientation === 'horizontal' ? itemWidth : itemHeight)

            const itemsTemplate = _createItems(data, data.orientation === 'horizontal' ? itemWidth : itemHeight);

            const navigationTemplate = `<div class="${options.arrowOrientation === "horizontal" ? "horizontal-arrows" : "vertical-arrows"}"><div class="picker-arrow prev"></div><div class="picker-arrow next"></div></div>`;

            const pickerTemplate =
                data.orientation === 'horizontal' ?
                    `<div class="picker"><div class="picker-slider" style="width:${elementWidth}px"><div class="picker-track" style="left:-${pickerStartPosition}px;transform: translateX(0px)">${itemsTemplate}</div></div>${navigationTemplate}</div>`
                    :
                    `<div class="picker"><div class="picker-slider vertical" style="height:${elementHeight}px"><div class="picker-track" style="top:-${pickerStartPosition}px;transform: translateY(0px)">${itemsTemplate}</div></div>${navigationTemplate}</div>`

            options.selector.insertAdjacentHTML("afterbegin", pickerTemplate);


            const scale = 1.3;
            setTimeout(function () {
                if (data.orientation === 'horizontal') {
                    var pickerHeight = options.selector.querySelector(".picker-item").offsetHeight * scale;
                    options.selector.querySelector(".picker").style.height = `${pickerHeight}px`;
                    options.selector.querySelector(".picker-track").style.height = `${pickerHeight}px`;
                } else {
                    var pickerWidth = options.selector.querySelector(".picker-item").offsetWidth * scale;
                    options.selector.querySelector(".picker").style.width = `${pickerWidth}px`;
                    options.selector.querySelector(".picker-track").style.width = `${pickerWidth}px`;
                }
            }, 50)



            options.selector.querySelector(`.picker-item:nth-child(${Math.ceil(data.length / 2)})`).classList.add("active");
        }

        class Plugin {
            constructor(options) {
                this.options = extend(defaults, options)
                this.init();
            }

            init() {
                this.options.selector = document.querySelector(this.options.selector)
                this.options.value = this.options.list ? this.options.list[0] : this.options.min + this.options.activeIndex;

                // Create Elements
                _createHtmlElements(this.options);

                // Add listeners
                _addListeners(this.options);
            }

            destroy() {
                _removeListeners(this.options);
                this.options.selector.querySelector('.picker').remove();
            }

            getValue() {
                return this.options.value;
            }

            setValue(newValue) {

                // Check if that value exist
                if (this.options.selector.querySelector(`[data-value="${newValue}"]`)) {

                    const oldValue = this.options.value;

                    let newIndex, oldIndex;

                    this.options.selector.querySelectorAll(".picker-item").forEach(function (item, index) {

                        if (item.getAttribute("data-value") === newValue.toString()) {
                            newIndex = index;
                        } else if (item.getAttribute("data-value") === oldValue.toString()) {
                            oldIndex = index;
                        }

                    });

                    const move = newIndex - oldIndex > 0 ? newIndex - oldIndex : newIndex + oldIndex + 1;

                    for (let j = 0; j < move; j++) {
                        _navigate(this.options, "next")
                    }

                } else {
                    console.log("That value doesn't exist!")
                }

            }

            prev() {
                _navigate(this.options, 'prev')
            }

            next() {
                _navigate(this.options, 'next')
            }
        }

        return Plugin;
    });