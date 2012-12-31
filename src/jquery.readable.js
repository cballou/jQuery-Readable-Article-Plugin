/**
 * The Readable Article plugin is intended to be used in blog posts and news
 * articles on mobile devices to increase readability for end users of mobile
 * devices.
 */
(function($) {

    // http://coding.smashingmagazine.com/2009/09/22/complete-guide-to-css-font-stacks/
    var _fontStacks = {
        'Helvetica/Arial': 'Frutiger, "Frutiger Linotype", Univers, Calibri, "Gill Sans", "Gill Sans MT", "Myriad Pro", Myriad, "DejaVu Sans Condensed", "Liberation Sans", "Nimbus Sans L", Tahoma, Geneva, "Helvetica Neue", Helvetica, Arial, sans-serif',
        'Verdana': 'Corbel, "Lucida Grande", "Lucida Sans Unicode", "DejaVu Sans", "Bitstream Vera Sans", "Liberation Sans", Verdana, "Verdana Ref", sans-serif',
        'Trebuchet': '"Segoe UI", Candara, "Bitstream Vera Sans", "DejaVu Sans", "Bitsream Vera Sans", "Trebuchet MS", Verdana, "Verdana Ref", sans-serif',
        'Sans-Serif': '"Proxima Nova Regular", "Helvetica Neue", Arial, Helvetica, sans-serif',
        'Sans-Serif Alt.': '"Myriad Pro", Arial, Helvetica, sans-serif',
        'PT Sans': '"PT Sans", "Trebuchet MS", Arial, sans-serif',
        'Geneva': 'Geneva, "Lucida Sans", "Lucida Grande", "Lucida Sans Unicode", Verdana, sans-serif',
        'Impact': 'Impact, Haettenschweiler, "Franklin Gothic Bold", Charcoal, "Helvetica Inserat", "Bitstream Vera Sans Bold", "Arial Black", sans-serif',
        'Garamond': '"Palatino Linotype", Palatino, Palladio, "URW Palladio L", "Book Antiqua", Baskerville, "Bookman Old Style", "Bitstream Charter", "Nimbus Roman No9 L", Garamond, "Apple Garamond", "ITC Garamond Narrow", "New Century Schoolbook", "Century Schoolbook", "Century Schoolbook L", Georgia, serif',
        'Serif': '"Fanwood Text", Georgia, Times, "Times New Roman", serif',
        'Times New Roman': 'Cambria, "Hoefler Text", Utopia, "Liberation Serif", "Nimbus Roman No9 L Regular", Times, "Times New Roman", serif',
        'Georgia': 'Constantia, "Lucida Bright", Lucidabright, "Lucida Serif", Lucida, "DejaVu Serif", "Bitstream Vera Serif", "Liberation Serif", Georgia, serif',
        'Monospace': 'Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace'
    };

    var _resizeOptions = {

    };

    $.fn.readable = function (options) {
        var $this = $(this),
            $clone = $this.clone(),
            $children = $clone.find('*'),
            $readable = $('#readable'),
            $readableBody,
            opts,
            bodyHeight,
            bodyWidth,
            OPTIMAL_WIDTH = 500,
            OPTIMAL_SIZE = 16;

        // handle user supplied options
        if (opts === 'close' || opts === 'cancel') {
            if ($readable.length && $iframe.is(':visible')) {
                $readable.stop(true, true).fadeOut(opts.fadeOutSpeed, function() {
                    opts.onAfterClose($readable);
                });
            }

            return;
        }

        // merge configuration options
        opts = $.extend({}, $.fn.readable.settings, options);

        // get the body size
        bodyHeight = $('body').height();
        bodyWidth = $('body').width();

        // check for existance of iframe
        if (!$readable.length) {
            $readable =
                $('<iframe id="readable" width="100%" height="100%" />')
                    .css({
                        display: 'none',
                        position: 'fixed',
                        zIndex: 99999999,
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        padding: '20px',
                        boxSizing: 'border-box',
                        MozBoxSizing: 'border-box',
                        WebkitBoxSizing: 'border-box',
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        background: '#FFF',
                        color: '#111'
                    })
                    .appendTo('body');
        }

        // handle the parent element style clone
        $clone.css(_getStyle($this));

        // handle all child element style cloning
        /*
        $children.each(function() {
            var $this = $(this);
            $this.css(_getStyle($this, opts.font));
        });
        */

        // append the parent element to the iframe
        $readableBody = $readable.contents().find('body');

        // build controls
        _buildControls($readableBody, bodyWidth, opts.font);

        // add content
        $readableBody.append($clone);

        // trigger before show callback
        opts.onBeforeShow.call($clone);

        // show the iframe
        $readable.stop(true, true).fadeIn(opts.fadeInSpeed, function() {
            // trigger completion callback
            opts.onAfterShow.call($clone);
        });

        /**
         * Wrapper for creating all of the actionable items.
         */
        function _buildControls($readableBody, bodyWidth, font) {
            var css = {
                position: 'relative',
                paddingTop: '30px',
                margin: '0 auto',
                width: bodyWidth > OPTIMAL_WIDTH ? OPTIMAL_WIDTH : bodyWidth,
                overflowX: 'hidden'
            };

            $readableBody.empty().css(_applyFontStyle(css, font));

            // whether to show the font selection
            if (opts.showFontSelection) {
                $readableBody.prepend(_buildFontDropdown());
            }

            // whether to show the font sizer
            if (opts.showFontSizer) {
                $readableBody.prepend(_buildFontSizer());
            }

            $readableBody.prepend(_buildCloseButton(bodyWidth));

            return $readableBody;
        }

        /**
         * Handles the close button.
         */
        function _buildCloseButton(bodyWidth) {
            var $closeBtn = $('<a href="#">Close Readable</a>')
                .css({
                    'position': 'fixed',
                    'display': 'block',
                    'top': 0,
                    'width': bodyWidth > OPTIMAL_WIDTH ? OPTIMAL_WIDTH : bodyWidth,
                    'height': '30px',
                    'lineHeight': '30px',
                    'zIndex': 999999,
                    'background': '#111',
                    'color': '#FFF',
                    'textAlign': 'center',
                    'textDecoration': 'none'
                })
                .on('click', function() {
                    var $readable = $('#readable');

                    // trigger onBeforeClose
                    opts.onBeforeClose.call($readable);

                    // hide the window
                    $readable.stop(true, true).fadeOut(opts.fadeOutSpeed, function() {
                        // trigger onAfterClose
                        opts.onAfterClose.call($readable);
                    });

                    return false;
                });

            return $closeBtn;
        }

        /**
         * Build out a font sizing utility to allow the user to easily zoom in
         * and out of the content.
         */
        function _buildFontSizer() {
            return '';
        }

        /**
         * Handles building the font stack list.
         */
        function _buildFontDropdown() {
            var i, $fontSelection, opts = [];

            $fontSelection = $('<select name="fontSelection" id="fontSelection" />')
                .css({
                    'minWidth': '100%',
                    'background': '#FFF',
                    'color': '#111',
                    'border': '1px solid #111',
                    'padding': '4px',
                    'margin': 0
                })
                .on('change', function() {
                    var $this = $(this);
                    if ($this.val() == '') {
                        return;
                    }

                    $(this).closest('body').css('font-family', _fontStacks[$this.val()]);
                });

            opts.push('<option>Change Font</option>');
            for (i in _fontStacks) {

                opts.push('<option value="' + i + '" title="' + _fontStacks[i].replace(/"/g, '&quot;') + '">' + i + '</option>' );
            }
            $fontSelection.html(opts.join(''));

            return $fontSelection;
        }

        /**
         * Simple handler for building
         */
        function _popup() {

        }

        /**
         * Given a DOM element, retrieve the style.
         */
        function _getStyle($elem, font) {
            var elem = $elem.get(0),
                dest = {},
                style, prop, camelize, camel, val, i, l;

            if (window.getComputedStyle) {
                camelize = function (a, b) {
                    return b.toUpperCase();
                };

                style = window.getComputedStyle(elem, null);
                if (style) {
                    if (style.length) {
                        for (i = 0, l = style.length; i < l; i++) {
                            prop = style[i];
                            camel = prop.replace(/\-([a-z])/, camelize);
                            val = style.getPropertyValue(prop);
                            dest[camel] = val;
                        }
                    } else {
                        for (prop in style) {
                            camel = prop.replace(/\-([a-z])/, camelize);
                            val = style.getPropertyValue(prop) || style[prop];
                            dest[camel] = val;
                        }
                    }

                    return _cleanStyles(dest, font);
                }
            }

            if (elem.currentStyle) {
                style = elem.currentStyle;
                for (prop in style) {
                    dest[prop] = style[prop];
                }

                return _cleanStyles(dest, font);
            }

            if (elem.style) {
                style = elem.style;
                for (prop in style) {
                    if (typeof style[prop] != 'function') {
                        dest[prop] = style[prop];
                    }
                }
            }

            return _cleanStyles(dest, font);
        }
    };

    /**
     * Ensures no functions or oddities exist.
     */
    function _cleanStyles(styles, font) {
        var i;

        for (i in styles) {
            if ($.type(styles[i]) == 'function') {
                delete styles[i];
            }
        }

        if (styles.cssText) {
            delete styles.cssText;
        }

        // start our blacklist
        return _blacklistStyles(styles, font);
    }

    /**
     * Ensures that we remove box sizing that may break functionality.
     */
    function _blacklistStyles(styles, font) {
        var blacklist = ['height', 'minHeight', 'maxHeight', 'width', 'minWidth',
                         'maxWidth', 'marginLeft', 'marginRight', 'paddingLeft',
                         'paddingRight', 'overflow', 'font', 'fontFamily',
                         'fontSize', 'lineHeight'];

        for (i in blacklist) {
            if (styles[blacklist[i]]) {
                delete styles[blacklist[i]];
            }
        }

        return styles;
    }

    /**
     * Handles applying a pre-selected font style from the user.
     */
    function _applyFontStyle(styles, font) {
        // determine font stack
        if (font.stack) {
            if (_fontStacks[font.stack]) {
                styles.fontFamily = _fontStacks[font.stack];
            } else {
                styles.fontFamily = _fontStacks[$.fn.readable.settings.font.stack];
            }
        }

        if (font.size) {
            styles.fontSize = font.size;
        } else {
            styles.fontSize = $.fn.readable.settings.font.size;
        }

        if (font.lineHeight) {
            styles.lineHeight = font.lineHeight;
        } else {
            styles.lineHeight = $.fn.readable.settings.font.lineHeight;
        }

        if (font.weight) {
            styles.fontWeight = font.weight;
        } else {
            styles.fontWeight = $.fn.readable.settings.font.weight;
        }

        return styles;
    }

    /**
     * Default settings.
     */
    $.fn.readable.settings = {
        fadeInSpeed: 600,
        fadeOutSpeed: 600,
        onBeforeShow: function($readable) { },
        onAfterShow: function($readable) { },
        onBeforeClose: function($readable) { },
        onAfterClose: function($readable) { },
        showFontSizer: false,
        showFontSelection: true,
        font: {
            stack: 'Sans-Serif',
            size: '16px',
            lineHeight: '1.4em',
            weight: 400
        }
    };

})(jQuery);
