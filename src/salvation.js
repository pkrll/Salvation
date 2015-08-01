/**
 * Salvation validation
 * A JavaScript Plugin
 *
 * Validates forms.
 *
 * @version 0.3.1
 * @author Ardalan Samimi
 */
(function(window) {
    // The default settings
    var defaults = {
        element         : false,
        dateFormat      : "MM/DD/YYYY",
        datePlaceholder : true
    }
    // The default patterns
    var patterns = {
        required        :/\S/,
        length          :'^(.{X,Y}$)',
        numeric         :/^(\d)+$/,
        alphanumeric    :/^([\d|\w])+$/
    }
    /**
     * Initialize the Salvation plugin.
     *
     * @param       object  The settings
     * @returns     object  An instance of Salvation
     */
    Salvation = function (options, userPatterns) {
        // Auto-instantiates if the object was
		// not called with the new-keyword.
        if (this instanceof Salvation) {
            var self = this;
            // Extend the default settings, but
            // exit if the element is not set.
            self.patterns = self.extend(patterns, userPatterns);
            self.settings = self.extend(defaults, options);
            if (self.settings.element === false) return null;
            self.element = self.settings.element;
            // Gather all the validation elements and
            // bind the submit event to validate.
            self.gatherElements();
            self.bindEvents();
            // It's common courtesy for date fields to
            // display which format they should be in,
            // but only if the plugin user thinks so.
            if (this.settings.datePlaceholder) {
                for (i = 0; i < self.validate.date.length; i++) {
                    var format = (self.validate.date[i].getAttribute("data-format") === null) ? self.settings.dateFormat : self.validate.date[i].getAttribute("data-format");
                    self.validate.date[i].setAttribute("placeholder", format);
                }
            }
            self.validationFailedStyle = "wrong";
        } else {
            return new Salvation(settings);
        }
    }

    Salvation.prototype = {
        /**
         * Gather all the children elements of the form,
         * and sort them according to their types, i.e.
         * all date elements inside validate.date.
         *
         * @returns     void
         */
        gatherElements: function() {
            this.children = this.getElementsByTagName(this.element, "input, select, textarea");
            this.validate = this.getElementsByAttributeAsObject(this.children, "data-validate");
            // For backward compatibility: if data-validate="length" is not specified,
            // and only the data-length attribute is set, those should be added to the
            // validation elements too, by using the extend method. Nifty.
            this.validate.length = this.extend(this.validate.length, this.getElementsByAttribute(this.children, "data-length"));
        },
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
            // this way to keep the references. (Previous version:
            // (Removes both the invalid class marker and the event
            // listener after it's called)
            var callback = function() {
                if (self.checkElementByPattern(this)) {
                    if (this.classList.contains(self.validationFailedStyle))
                        this.classList.remove(self.validationFailedStyle);
                    // this.removeEventListener("change", arguments.callee, false);
                } else {
                    if (this.classList.contains(self.validationFailedStyle) === false)
                        this.classList.add(self.validationFailedStyle);
                }
            }
            // The validation process
            this.element.addEventListener("submit", function (event) {
                for (field in self.validate) {
                    var validateFields = self.getElementsByPattern(self.validate[field], self.patterns[field], field);
                    if (validateFields.length > 0) {
                        self.addClassToElements(validateFields, self.validationFailedStyle);
                        self.addEventListener(validateFields, "change", callback);
                        event.preventDefault();
                    }
                }
            });
        },
        /**
         * Find elements by tag name(s).
         *
         * @param       element         Element to search within
         * @param       string          Tag name(s) to find
         * @returns     HTMLCollection  List of elements
         */
        getElementsByTagName: function (element, tagName) {
            if (tagName.indexOf(",") === -1)
                return element.getElementsByTagName(tagName);
            else
                return element.querySelectorAll(tagName);
        },
        /**
         * Find elements by attribute name, with option
         * to also go by the attribute value.
         *
         * @param       elements    Array of elements to search
         * @param       string      Value to find
         * @returns     array       List of elements found
         */
        getElementsByAttribute: function (elements, attribute, value) {
            var foundElements = [], value = value || null;
            for (i = 0; i < elements.length; i++) {
                // If the value parameter is set, return only the
                // elements that has the given attribute value.
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
         * Same as getElementsByAttribute, but can instead search
         * for multiple attributes, as set in the attribute param
         * delimited by a comma. (Deprecated)
         *
         * @param       elements    Array of elements to search
         * @param       string      Attribute(s) to find, delmited by a comma.
         * @param       string      Value to find
         * @returns     array       List of elements found
         */
        getElementsByAttributes: function (elements, attributes, value) {
            var foundElements = [], value = value || null;
            // Split the attribute string by the comma-delimiter,
            // the /\s/g makes sure any whitespace is removed.
            var attributes = attributes.replace(/\s/g, '').split(",");
            for (i = 0; i < elements.length; i++) {
                // Go through each item of the attributes array
                attributes.map(function(attribute) {
                    if (value !== null) {
                        if (elements[i].getAttribute(attribute) === value && foundElements.indexOf(elements[i]) === -1)
                            foundElements.push(elements[i]);
                    } else {
                        if (elements[i].getAttribute(attribute) !== null && foundElements.indexOf(elements[i]) === -1)
                            foundElements.push(elements[i]);
                    }
                });
            }

            return foundElements;
        },
        /**
         * Find elements by attribute name, and return
         * them as an object with attribute value as key.
         * This method will sort elements in different
         * objects, depending on attributes. An element
         * with multiple attribute values will be added
         * to multiple objects.
         *
         * @param       elements    Array of elements to search
         * @param       string      Attribute to find
         * @returns     object      List of elements found
         */
        getElementsByAttributeAsObject: function (elements, attribute) {
            var foundElements = {};
                for (i = 0; i < elements.length; i++) {
                    var attributeValues = elements[i].getAttribute(attribute);
                    if (attributeValues === undefined || attributeValues === null)
                        continue;
                    // Because elements can have multiple attribute values,
                    // delimited by a comma, split the attribute string and
                    // loop through each value and add it to the object. The
                    // /\s/g makes sure any whitespace is removed from the
                    // attributes value ("value1, value2" => ["value1","value2"]).
                    attributeValues = attributeValues.replace(/\s/g, '').split(",");
                    for (x = 0; x < attributeValues.length; x++) {
                        // The attribute value will also serve as the
                        // key in the object that will be returned.
                        var key = attributeValues[x];
                        if (key !== undefined && key !== null) {
                        // Check that the element[key] is an array, otherwise
                        // the push function will not work.
                        if (foundElements[key] === undefined || foundElements[key].constructor !== Array)
                            foundElements[key] = [];
                            foundElements[key].push(elements[i]);
                        }
                    }
                }

            return foundElements;
        },
        /**
         * Find elements by their values. (Deprecated)
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
            // The length is a special case, where the placeholders
            // of the search pattern (X,Y) first must be replaced by
            // the value(s) specified in the attribute.
            if (type === "length") {
                for (i = 0; i < elements.length; i++) {
                    var length = elements[i].getAttribute("data-length");
                    var format = elements[i].getAttribute("data-format");
                    // Format can be either max or min
                    if (format === "max") {
                        // The length attribute combined with the format
                        // attribute must only contain one digit for it
                        // to be considered valid.
                        if (/^([0-9]$)/.test(length))
                            var string = new RegExp(rule.replace("X,Y", "0," + length));
                        else
                            continue
                    } else if (format === "min") {
                        if (/^([0-9]$)/.test(length))
                            var string = new RegExp(rule.replace("X,Y", length + ","));
                        else
                            continue
                    } else {
                        // Even if a format attribute is not set, the validation
                        // of the element should differ, depending on how the
                        // length attribute is set up.
                        if (/^([0-9]\,[0-9]$)/.test(length))
                            // Normal case, a max and min is specified ("1,5").
                            var string = new RegExp(rule.replace("X,Y", length));
                        else if (/^([0-9]\,$)/.test(length))
                            // A single digit with a comma at the end is to be
                            // considered minimum length ("1,")
                            var string = new RegExp(rule.replace("X,Y", length));
                        else if (/^([0-9]$)/.test(length))
                            // A single digit without a comma should be treated
                            // as max length, but for the regex to work a zero
                            // needs to be added at the beginning. ("5") => ("0,5")
                            var string = new RegExp(rule.replace("X,Y", "0," + length));
                        else
                            // If none of the above checks out it is not a valid
                            // value, skip this one and move to the next.
                            continue;
                    }
                    // Test the length
                    if (string.test(elements[i].value) === false)
                        foundElements.push(elements[i]);
                }
            // Date is also a special case, where the regex pattern
            // needs to be build depending on the format specified.
            } else if (type === "date") {
                // The date delimiter can be almost any non-word
                // character, therefore the regex pattern \W.
                var delimiterPattern = new RegExp(/([\W])/), delimiterMatches;
                for (i = 0; i < elements.length; i++) {
                    var elementValue = elements[i].value;
                    if (elementValue.length < 1)
                        continue;
                    // Retrieve the date format from the element
                    var format = elements[i].getAttribute("data-format");
                    if (format === null)
                        format = this.settings.dateFormat;
                    if ((delimiterMatches = delimiterPattern.exec(format)) !== null) {
                        var dateComponents = format.split(delimiterMatches[0]);
                        var dateBrokenDown = elementValue.split(delimiterMatches[0]);
                        var date = [];
                        // Begin building the date pattern
                        var validDatePattern = "^(";
                        for (x = 0; x < dateComponents.length; x++) {
                            // Create an array out of the components and inputed date
                            // for later use, to make sure that it is an actual date.
                            var key = dateComponents[x][0].toUpperCase();
                            date[key] = dateBrokenDown[x];
                            // Dates and months should have an interval length,
                            // so that if they are set to max 2 digits (MM) the
                            // user should not have to write a leading zero, as
                            // this often isn't how date parsers read a date.
                            if (key !== "Y")
                                var length = "1," + dateComponents[x].length;
                            else
                                var length = dateComponents[x].length;
                            // Keep building that pattern, man.
                            validDatePattern += "\\d{" + length + "}";
                            // Add the delimiter, but not to the last digit.
                            if (dateComponents.length > x+1)
                                validDatePattern += "\\" + delimiterMatches[0];
                        }
                        // Close the date pattern.
                        validDatePattern += ")$";
                        // Test the date
                        var validDate = new RegExp(validDatePattern);
                        if (validDate.test(elementValue) === false) {
                            foundElements.push(elements[i]);
                        } else {
                            // Even if the date has the right format, it may not be an
                            // actual date. This will make sure that the date exists.
                            // The year must be four digits, so add the first two digits
                            // if they are missing.
                            if (date["Y"].length == 2)
                                date["Y"] = new Date().getFullYear().toString().substr(0,2) + date["Y"];
                            // Also, remove 0 if month and date begins with one.
                            date["M"] = date["M"].replace(/^0/, '');
                            date["D"] = date["D"].replace(/^0/, '');
                            // Create the date object, and retrieve the individual
                            // components to compare it to the inputed date. If the
                            // date is wrong, the parsed date will not be the same
                            // as the user inputed one (JS will parse for example
                            // 31st of february as a valid date).
                            var dateObject = new Date(date["Y"], (date["M"]-1), date["D"]);
                            var dateParsed = dateObject.getFullYear() +''+ (dateObject.getMonth()+1) +''+ dateObject.getDate();
                            var dateString = date["Y"] +''+ date["M"] +''+ date["D"];
                            if (dateParsed !== dateString)
                                foundElements.push(elements[i]);
                        }
                    }
                }
            } else {
                var string = new RegExp(rule);
                for (i = 0; i < elements.length; i++)
                    if (string.test(elements[i].value) === false)
                        if (type === "required" ||
                            type !== "required" && elements[i].value.length > 1)
                            foundElements.push(elements[i]);
            }
            return foundElements;
        },
        /**
         * Validates a single element. Used as callback on invalidated
         * elements to check when they are valid.
         *
         * @param       element     The element to check.
         * @returns     bool        True on valid
         */
        checkElementByPattern: function (element) {
            // Begin with checking the validate
            var elementAsArray = [ element ], foundElement = [];
            var validationType = element.getAttribute("data-validate");
            if (validationType !== null) {
                validationType = validationType.replace(/\s/g, "").split(",");
                for (i = 0; i < validationType.length; i++)
                    foundElement = this.getElementsByPattern(elementAsArray, this.patterns[validationType[i]], validationType[i]);
                if (foundElement.length > 0)
                    return false;
            }
            // As data-validate="length" has already been checked,
            // only check the elements with data-length set.
            if (element.getAttribute("data-length") !== null &&
                validationType.indexOf("length") === -1) {
                validationType = "length";
                foundElement = this.getElementsByPattern(elementAsArray, this.patterns["length"], validationType);
                if (foundElement.length > 0)
                    return false;
            }

            return true;
        }
    }

})(window, document);
