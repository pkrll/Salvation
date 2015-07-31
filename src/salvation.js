/**
 * Salvation validation
 * A JavaScript Plugin
 *
 * Validates forms.
 *
 * @version 0.2.1
 * @author Ardalan Samimi
 */
(function(window) {
    // The default settings
    var defaults = {
        element:    false
    }

    Salvation = function (options) {
        this.settings = this.extend(defaults, options);

        this.validationFailedStyle = "wrong";

        this.element    = this.settings.element;
        this.children   = this.getElementsByTagName(this.element, "input");
        this.required   = this.getElementsByAttribute(this.children, "required");
        this.specials   = {
            date:         this.getElementsByAttribute(this.children, "data-date"),
            length:         this.getElementsByAttribute(this.children, "data-length"),
            numeric:        this.getElementsByAttribute(this.children, "data-format", "numeric"),
            alphanumeric:   this.getElementsByAttribute(this.children, "data-format", "alphanumeric")
        }
        this.patterns   = {
            length:         '^(.{X,Y}$)',
            numeric:        /^(\d)+$/,
            alphanumeric:   /^([\d|\w])+$/
        }

        this.bindEvents();
    }

    Salvation.prototype = {
        /**
         * Extend the default options with
         * user inputed ones.
         *
         * @param       object      Default settings
         * @param       object      User defined settings
         * @returns     object
         */
        extend: function (defaults, options) {
            var option;
            for (option in options)
                if (options.hasOwnProperty(option))
                    defaults[option] = options[option];
            return defaults;
        },
        /**
         * Add a given class to a collection of elements.
         *
         * @param       array       An array of elements to manipulate
         * @param       string      Name of class
         */
        addClassToElements: function (elements, className) {
            elements.map(function (element) {
                element.classList.add(className);
            });
        },
        /**
         * Add an event listener to all elements in an array.
         *
         * @param       array       An array of elements to manipulate
         * @param       string      The event type
         * @param       function    The event listener
         */
        addEventListener: function (elements, event, callback) {
            elements.map(function (element) {
                element.addEventListener(event, callback);
            });
        },
        /**
         * Sets the actual validation control.
         *
         */
        bindEvents: function() {
            var self = this;
            // Callback for the addEventListener method, defined
            // this way to keep the references. Removes both the
            // invalid class and event listener after it's called.
            var callback = function() {
                if (this.classList.contains(self.validationFailedStyle))
                    this.classList.remove(self.validationFailedStyle);
                this.removeEventListener("keyup", arguments.callee, false);
            }
            // The validation process
            this.element.addEventListener("submit", function (event) {
                // Check required fields first
                var emptyFields = self.getElementsByValue(self.required, "");
                if (emptyFields.length > 0) {
                    self.addClassToElements(emptyFields, self.validationFailedStyle);
                    self.addEventListener(emptyFields, "keyup", callback);
                    event.preventDefault();
                }
                // The special fields
                for (special in self.specials) {
                    var specialFields = self.getElementsByPattern(self.specials[special], self.patterns[special], special);
                    if (specialFields.length > 0) {
                        self.addClassToElements(specialFields, self.validationFailedStyle);
                        self.addEventListener(specialFields, "keyup", callback);
                        event.preventDefault();
                    }
                }
                event.preventDefault();

            });
        },
        /**
         * Find elements by tag name.
         *
         * @param       element     Element to search within
         * @param       string      Tag name to find
         * @returns     array       List of elements found
         */
        getElementsByTagName: function (element, tagName) {
            return element.getElementsByTagName(tagName);
        },
        /**
         * Find elements by attribute name, with option
         * to also go by the attribute value.
         *
         * @param       elements    Array of elements to search
         * @param       string      Attribute to find
         * @param       string      Value to find
         * @returns     array       List of elements found
         */
        getElementsByAttribute: function (elements, attribute, value) {
            var foundElements = [], value = value || null;
            for (i = 0; i < elements.length; i++) {
                if (value !== null) {
                    if (elements[i].getAttribute(attribute) === value)
                        foundElements.push(elements[i]);
                } else {
                    if (elements[i].getAttribute(attribute) !== null)
                        foundElements.push(elements[i]);
                }
            }

            return foundElements;
        },
        /**
         * Find elements by their values.
         *
         * @param       elements    Array of elements to search
         * @param       string      Value to find
         * @returns     array       List of elements found
         */
        getElementsByValue: function (elements, value) {
            var foundElements = [];
            for (i = 0; i < elements.length; i++)
                if (elements[i].value === value)
                    foundElements.push(elements[i]);
            return foundElements;
        },
        /**
         * Find elements by a regular expression pattern.
         *
         * @param       elements    Array of elements to search
         * @param       string      Search pattern
         * @param       string      Type of pattern
         * @returns     array       List of elements found
         */
        getElementsByPattern: function (elements, rule, type) {
            var foundElements = [];
            // Data-length is a special case, where the placeholders
            // of the search pattern (X,Y) first must be replaced by
            // the values specified in the attribute.
            if (type === "length") {
                for (i = 0; i < elements.length; i++) {
                    if (elements[i].value.length === 0)
                        continue;
                    // Check length attribute specifies both a min and max
                    // length, if not add a "0," for the regex to work.
                    var length = elements[i].getAttribute("data-" + type);
                    if (/^([0-9]\,[0-9]$)/.test(length))
                        var string = new RegExp(rule.replace("X,Y", length));
                    else if (/^([0-9]$)/.test(length))
                        var string = new RegExp(rule.replace("X,Y", "0," + length));
                    else
                        // If none of the above checks out, it is not a valid
                        // value, skip this one and move to the next.
                        continue;
                    if (string.test(elements[i].value) === false)
                        foundElements.push(elements[i]);
                }
            } else if (type === "date") {
                var delimiterPattern = new RegExp(/([\W])/), delimiterMatches;
                for (i = 0; i < elements.length; i++) {
                    var elementValue = elements[i].value;
                    if (elementValue.length === 0)
                        continue;
                    // Retrieve the date format from the element
                    var format = elements[i].getAttribute("data-date");
                    if ((delimiterMatches = delimiterPattern.exec(format)) !== null) {
                        var dateComponents = format.split(delimiterMatches[0]);
                        var dateBrokenDown = elementValue.split(delimiterMatches[0]);
                        var date = [];
                        // Begin the date pattern
                        var validDatePattern = "^(";
                        // Build the date pattern
                        for (x = 0; x < dateComponents.length; x++) {
                            // Create an array out of the components and inputed date
                            // for later use, to make sure that it is an actual date.
                            var key = dateComponents[x][0].toUpperCase();
                            date[key] = dateBrokenDown[x];
                            // Dates and months should have a interval length,
                            // so that if they are set to max 2 digits (MM) the
                            // user should not have to write a leading zero, as
                            // this often isn't how date parsers read a date.
                            if (key !== "Y")
                                var length = "1," + dateComponents[x].length;
                            else
                                var length = dateComponents[x].length;
                            // Keep building that pattern, man.
                            validDatePattern += "\\d{" + length + "}";
                            // Add the delimiter, but not to the last digit
                            if (dateComponents.length > x+1)
                                validDatePattern += "\\" + delimiterMatches[0];
                        }
                        // Close the date pattern
                        validDatePattern += ")$";
                        // Test the date
                        var validDate = new RegExp(validDatePattern);
                        if (validDate.test(elementValue) === false) {
                            foundElements.push(elements[i]);
                        } else {
                            // Even if the date has the right format, it may not be an
                            // actual date. This will make sure that the date exists.
                            // The date must be four digits, so add the first two digits
                            // if they are missing.
                            if (date["Y"].length == 2)
                                date["Y"] = new Date().getFullYear().toString().substr(0,2) + date["Y"];
                            // Also, remove 0 if month and date begins with one.
                            date["M"] = date["M"].replace(/^0/, '');
                            date["D"] = date["D"].replace(/^0/, '');
                            // Create the date object, and retrieve the individual
                            // components to compare it to the inputed date. If the
                            // date is wrong, the parsed date will not be the same
                            // as the user inputed one.
                            var dateObject = new Date(date["Y"], (date["M"]-1), date["D"]);
                            var dateParsed = dateObject.getFullYear() +''+ (dateObject.getMonth()+1) +''+ dateObject.getDate();
                            var dateString = date["Y"] +''+ date["M"] +''+ date["D"];
                            if (dateParsed != dateString)
                                foundElements.push(elements[i]);
                        }
                    }
                }
            } else {
                var string = new RegExp(rule);
                for (i = 0; i < elements.length; i++)
                    if (elements[i].value.length > 0 && string.test(elements[i].value) === false)
                        foundElements.push(elements[i]);
            }
            return foundElements;
        }
    }

})(window, document);
