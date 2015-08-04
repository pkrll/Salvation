/**
 * Salvation validation
 * A JavaScript Plugin.
 *
 * Validates forms.
 *
 * @version 0.4.0
 * @author Ardalan Samimi
 */
(function() {
    // Only HTMLFormElements should be extended
    HTMLFormElement.prototype.addSalvation = function (options, rules) {
        options.element = false;
        return new Salvation(options, rules, this);
    }
    // The default settings
    var defaults = {
        element         : false,
        dateFormat      : "MM/DD/YYYY",
        datePlaceholder : true,
        defaultLabel    : "Invalid value"
    }
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
    Salvation = function (paramSettings, paramPatterns, element) {
        // Auto-instantiates if the object was
		// not called with the new-keyword.
        if (this instanceof Salvation) {
            this.settings = this.extend(defaults, paramSettings);
            // Extend patterns variable, But switch places with
            // the user defined and default patterns to make
            // sure that the defaults doesn't get overwritten.
            this.patterns = this.extend(paramPatterns, patterns);
            this.stylings = {
                error   : "salvation-error",
                clear   : "salvation-clear"
            }
            this.invalidElements = [];
            // If the element was not created using the constructor pattern, the element
            // was not set in the options object and must have therefore been extended.
            this.element = (this.settings.element === false) ? element : this.settings.element;
            // Elements with data-validate-attribute are the only ones that should be validated,
            // but make exception for data-length types.
            var childNode = this.getElementsByTagName(this.element, "input, select, textarea");
            this.validate = this.getElementsByAttributeAsObject(childNode, "data-validate");
            // For backward-compatibility: if data-validate="length" is not specified,
            // and only the data-length attribute is set, those should be added to the
            // validation elements too, by using the extend method.
            this.validate.length = this.extend(this.validate.length, this.getElementsByAttribute(childNode, "data-length"));
            // Initialize the validation process
            this.element.addEventListener("submit", this.deadValidation.bind(this));
            this.element.addEventListener("change", this.liveValidation.bind(this));
            // Push dynamically added form elements to the validation array
            this.element.addEventListener("DOMNodeInserted", this.nodeInserted.bind(this));
        } else {
            return new Salvation(paramSettings, paramPatterns, element);
        }
    }

    Salvation.prototype = {
        /**
         * Make a array out of a string
         * delimited by a comma.
         *
         * @param       string
         * @returns     array
         */
        splitStringByComma: function (attribute) {
            return attribute.replace(/\s/g, "").split(",");
        },
        /**
         * Extend a given object with
         * another object.
         *
         * @param       object      Object that is to be extended
         * @param       object      Object with properties to add to first object
         * @returns     object
         */
        extend: function (primary, secondary) {
            var primary = primary || {};
            for (var property in secondary)
                if (secondary.hasOwnProperty(property))
                    primary[property] = secondary[property];
            return primary;
        },
        /**
         * Callback function for event submit.
         * Validates elements, but will first
         * check if the global "formInvalid"-
         * variable is set, before validation.
         *
         * @param       Event
         */
        deadValidation: function (event) {
            var self = this;
            if (this.invalidElements.length > 0) {
                event.preventDefault();

            }
            // Even if the invalidElements count
            // does not indicate any invalidated
            // elements, the plugin should make
            // sure that there are none that did
            // somehow bypass the control. This
            // is an issue mainly when submitting
            // without editing a form.
            for (var validationType in self.validate) {
                var invalidFields = self.getElementsByPattern(self.validate[validationType], self.patterns[validationType], validationType);
                if (invalidFields.length > 0) {
                    this.invalidElements = invalidFields;
                    event.preventDefault();
                    // The warning method
                    self.onInvalidation(invalidFields);
                }
            }
        },
        /**
         * Callback function for the change
         * event. Validates elements live.
         *
         * @param       Event
         */
        liveValidation: function(event) {
            var target = event.target;
            if (this.checkElementByPattern(target)) {
                if (this.invalidElements.indexOf(target) > -1)
                    this.invalidElements.splice(this.invalidElements.indexOf(target), 1);
                this.onValidation([target]);
            } else {
                if (this.invalidElements.indexOf(target) === -1)
                    this.invalidElements.push(target);
                this.onInvalidation([target]);
            }
        },
        /**
         * Callback for DOMNodeInserted.
         * Adds inserted element to the
         * elements list, if it has the
         * appropriate attributes.
         *
         * @param       Event
         */
        nodeInserted: function (event) {
            // Check if the node is a child of the plugin's element.
            if (event.relatedNode === this.element) {
                var attributeValues = event.target.getAttribute("data-validate");
                if (attributeValues !== null) {
                    attributeValues = this.splitStringByComma(attributeValues);
                    for (var x = 0; x < attributeValues.length; x++) {
                        var key = attributeValues[x];
                        if (key === undefined || key === null)
                            continue;
                        this.validate[key].push(event.target);
                    }
                }
                if (event.target.hasAttribute("data-length") &&
                    this.validate["length"].indexOf(event.target) === -1)
                    this.validate["length"].push(event.target);
            }
        },
        /**
         * Description of what this does.
         *
         * @param
         * @returns
         */
        onInvalidation: function (elements) {
            var elements = elements || [];
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].classList.contains(this.stylings.error) === false)
                    elements[i].classList.add(this.stylings.error);
                if (i === 0)
                    elements[i].focus();
            }
        },
        onValidation: function (elements) {
            var elements = elements || [];
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].classList.contains(this.stylings.error))
                    elements[i].classList.remove(this.stylings.error);
            }
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
            var foundElements = [], value = value || null, attributes = this.splitStringByComma(attributes);
            for (i = 0; i < elements.length; i++) {
                for (x = 0; x < attributes.length; x++) {
                    if (value === null) {
                        if (elements[i].getAttribute(attributes[x]) !== value &&
                            foundElements.indexOf(elements[i]) === -1)
                            foundElements.push(elements[i]);
                    } else {
                        if (elements[i].getAttribute(attributes[x]) === value &&
                            foundElements.indexOf(elements[i]) === -1)
                            foundElements.push(elements[i]);
                    }
                }
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
                    // Elements can have multiple attribute values,
                    // the string should be delimited by a comma.
                    attributeValues = this.splitStringByComma(attributeValues);
                    for (var x = 0; x < attributeValues.length; x++) {
                        // The attribute value will also serve as the
                        // key in the object that will be returned.
                        var key = attributeValues[x];
                        if (key === undefined || key === null)
                            continue;
                        // The key must exist in the element as an
                        // array, otherwise push() will fail.
                        if (foundElements[key] === undefined || foundElements[key].constructor !== Array)
                            foundElements[key] = [];
                            foundElements[key].push(elements[i]);
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
            for (var i = 0; i < elements.length; i++)
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
                for (var i = 0; i < elements.length; i++) {
                    // Length attribute is not a substitute for the
                    // required attribute. Length just states what
                    // min/max-length an element should have, if it
                    // is filled in.
                    if (elements[i].value === "")
                        continue;
                    var length = elements[i].getAttribute("data-length");
                    var format = elements[i].getAttribute("data-format");
                    // Format can be either max or min. The length
                    // attribute combined with the format attribute
                    // must only contain one digit for it to be
                    // considered valid.
                    if (format === "max") {
                        if (/^([0-9]$)/.test(length))
                            var string = new RegExp(rule.replace("X,Y", "0," + length));
                        else
                            continue;
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
                    if (string.test(elements[i].value) === false)
                        foundElements.push(elements[i]);
                }
            } else if (type === "date") {
                // Date is also a special case, where the regex pattern
                // needs to be build depending on the format specified.
                // The date delimiter can be almost any non-word
                // character, therefore the regex pattern \W.
                var delimiterPattern = new RegExp(/([\W])/), delimiterMatches;
                for (var i = 0; i < elements.length; i++) {
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
                        for (var x = 0; x < dateComponents.length; x++) {
                            // Create an array out of the components and inputed date
                            // for later use, to make sure that it is an actual date.
                            var key = dateComponents[x][0].toUpperCase();
                            date[key] = dateBrokenDown[x];
                            // Dates and months should have an interval-length,
                            // so that if they are set to max 2 digits (MM) the
                            // user should not have to write a leading zero, as
                            // this often isn't how date parsers read a date.
                            if (key !== "Y")
                                var length = "1," + dateComponents[x].length;
                            else
                                var length = dateComponents[x].length;
                            validDatePattern += "\\d{" + length + "}";
                            // Add the delimiter, but not to the last digit.
                            if (dateComponents.length > x+1)
                                validDatePattern += "\\" + delimiterMatches[0];
                        }
                        // Close the date pattern.
                        validDatePattern += ")$";
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
                for (var i = 0; i < elements.length; i++) {
                    if (string.test(elements[i].value) === false) {
                        if (type === "required" ||
                            type !== "required" && elements[i].value.length > 0)
                            foundElements.push(elements[i]);
                    }

                }

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
            var elementAsArray = [ element ],
                validationType = element.getAttribute("data-validate") || null;
                invalidElement = [];
            if (validationType !== null) {
                validationType = this.splitStringByComma(validationType);
                for (var i = 0; i < validationType.length; i++) {
                    invalidElement = this.getElementsByPattern(elementAsArray, this.patterns[validationType[i]], validationType[i]);
                    if (invalidElement.length > 0)
                        return false;
                }
            }
            // As data-validate="length" has already been checked,
            // only check the elements with data-length set.
            if (element.getAttribute("data-length") === null ||
                validationType !== null && validationType.indexOf("length") !== -1)
                return true;
            validationType = "length";
            invalidElement = this.getElementsByPattern(elementAsArray, this.patterns[validationType], validationType);
            if (invalidElement.length > 0)
                return false;

            return true;
        }
    }

})();
