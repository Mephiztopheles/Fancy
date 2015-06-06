(function (window, $) {

    Fancy.require({
        jQuery: false,
        Fancy: "1.1.0"
    });
    var i = 1,
        NAME = "FancyDate",
        VERSION = "2.1.1",
        logged = false;

    function findByKey(obj, index) {
        var r,
        i = 0;
        for (var k in obj) {
            if (i == index) r = k;
            i++;
        }
        return r;
    }

    function FancyDate(element, settings) {
        var SELF = this;
        if (element[0].nodeName != 'INPUT') {
            console.error(NAME + ' needs an input to be bound to!');
            return;
        }

        SELF.settings = $.extend({}, Fancy.settings[NAME], settings);
        SELF.visible = false;
        SELF.calculate = {
            day: 24 * 60 * 60 * 1000,
            hour: 60 * 60 * 1000,
            minute: 60 * 1000,
            second: 1000
        };

        SELF.element = element;
        SELF.version = VERSION;
        SELF.name = NAME;

        SELF.enable = function () {};

        SELF.disable = function () {};

        SELF.today = SELF.decode(SELF.encode(new Date()));
        SELF.current = SELF.element.val() ? SELF.decode(SELF.element.val()) : SELF.decode(SELF.encode(new Date()));
        SELF.selected = SELF.decode(SELF.element.val());

        SELF.init();
        return SELF;
    }


    FancyDate.api = FancyDate.prototype = {};
    FancyDate.api.version = VERSION;
    FancyDate.api.name = NAME;
    FancyDate.api.init = function () {
        var SELF = this;
        if (!logged) {
            logged = true;
            Fancy.version(SELF);
        }

        this.html = {
            wrapper: $('<div/>', {
                id: SELF.name + '-wrapper'
            }),
            dialog: $('<div/>', {
                id: SELF.name + '-dialog'
            }).attr('onselectstart', function () {
                return false;
            }),
            inner: $('<div/>', {
                id: SELF.name + '-inner'
            }),
            previous: $('<div/>', {
                id: SELF.name + '-previous',
                class: SELF.name + '-button'
            }),
            previousArrow: $("<div/>", {
                class: SELF.name + '-arrow'
            }),
            next: $('<div/>', {
                id: SELF.name + '-next',
                class: SELF.name + '-button'
            }),
            nextArrow: $("<div/>", {
                class: SELF.name + '-arrow'
            }),
            title: $('<div/>', {
                id: SELF.name + '-title'
            }),
            year: $('<span/>', {
                id: SELF.name + '-year'
            }),
            yearChanger: $("<div/>", {
                id: SELF.name + '-year-changer'
            }),
            month: $('<span/>', {
                id: SELF.name + '-month'
            }),
            header: $('<div/>', {
                id: SELF.name + '-header'
            }),
            body: $('<div/>', {
                id: SELF.name + '-body'
            }),
            footer: $('<div/>', {
                id: SELF.name + '-footer'
            }),
            close: $('<div/>', {
                id: SELF.name + '-close',
                class: SELF.name + '-button',
                html: SELF.translate('button', 'close')
            }),
            today: $('<div/>', {
                id: SELF.name + '-today',
                class: SELF.name + '-button',
                html: SELF.translate('button', 'today')
            }),
            clear: $('<div/>', {
                id: SELF.name + '-clear',
                class: SELF.name + '-button',
                html: SELF.translate('button', 'clear')
            }),
            calendar: $('<div/>', {
                id: SELF.name + '-calendar'
            }),
            days: [],
            rows: []
        };

        SELF.element.on('focus', function () {
            if (!SELF.visible && SELF.settings.query(SELF.element)) SELF.show();
        }).on("blur." + NAME, function (e) {
            setTimeout(function () {
                if (SELF.html.dialog.is(':visible') && !e.relatedTarget) SELF.element[0].focus();
                else SELF.close();
            }, 1);
        }).addClass(SELF.name + '-element').data(SELF.name, SELF);

    };
    FancyDate.api.show = function () {
        var SELF = this;
        if (!SELF.element[0].readOnly && !SELF.element[0].disabled) {
            if (this.settings.free) {
                $("body").append(SELF.html.wrapper).addClass(SELF.name);
                SELF.html.wrapper.append(SELF.html.dialog);
            } else {
                $("body").append(SELF.html.dialog).addClass(SELF.name);
            }
            SELF.html.dialog.append(SELF.html.inner);
            SELF.html.inner.append(SELF.html.header).append(SELF.html.body).append(SELF.html.footer);
            SELF.html.header.append(SELF.html.previous.append(SELF.html.previousArrow)).append(SELF.html.title).append(SELF.html.next.append(SELF.html.nextArrow));
            SELF.html.body.html(SELF.html.calendar);
            SELF.html.footer.html(SELF.html.close).append(SELF.html.today).append(SELF.html.clear);

            SELF.html.dialog.hide();

            function show() {
                SELF.html.dialog.show();
                SELF.visible = true;
                SELF.create();
                SELF.settings.onShow.call(SELF);
            }

            if (SELF.settings.free) {
                SELF.html.wrapper.unbind('.' + NAME).on("click." + NAME, function (e) {
                    if ($(e.target).is(SELF.html.wrapper)) {
                        SELF.close();
                    }
                });
            } else {
                $(document).unbind('.' + NAME).on("click." + NAME, function (e) {
                    if (!$(e.target).is(SELF.element) && !$(e.target).closest('#' + NAME + '-dialog').length && !$(e.target).is('#' + NAME + '-dialog')) {
                        SELF.close();
                    }
                });
            }

            if (SELF.settings.animated) {
                setTimeout(function () {
                    show();
                    SELF.html.dialog.addClass('show').removeClass('hide');
                });
            } else {
                show();
            }
        }

        return SELF;
    };
    FancyDate.api.close = function () {
        var SELF = this;
        if (!SELF.html.dialog.hasClass('hide')) {
            SELF.element.unbind('.' + SELF.name + ':prevent');

            function hide() {
                SELF.html.wrapper.remove();
                SELF.html.dialog.remove();
                SELF.html.calendar.children().remove();
                SELF.html.header.children().remove();
                SELF.html.title.children().remove();
                SELF.element.unbind("." + NAME + ":prevent");
                SELF.element[0].blur();
                SELF.visible = false;
                SELF.settings.onClose.call(SELF);
                $('body').removeClass(SELF.name);
            }

            if (SELF.settings.animated) {
                setTimeout(hide, 300);
                SELF.html.dialog.addClass('hide').removeClass('show');
            } else {
                hide();
            }
        }

        return SELF;
    };
    FancyDate.api.update = function () {
        var SELF = this;
        SELF.html.calendar.html('');
        SELF.html.title.html(SELF.html.month.html(SELF.translate('month', SELF.current.getMonth()))).append(SELF.html.year.html(SELF.current.getFullYear()));
        SELF.create();
    };
    FancyDate.api.create = function () {
        var SELF = this,
            current = new Date(SELF.current.getFullYear(), SELF.current.getMonth(), 1),
            i = 0,
            n = 0;
        SELF.html.title.append(SELF.html.month.html(SELF.translate("month", SELF.current.getMonth()))).append(SELF.html.year.html(SELF.current.getFullYear()));
        SELF.html.title.append(SELF.html.yearChanger);
        SELF.html.yearChanger.children().remove();
        if (current.getDay() != 1 && current.getDay() != 0) {
            var c = new Date(SELF.current.getFullYear(), SELF.current.getMonth(), 0);
            current = new Date(SELF.current.getFullYear(), SELF.current.getMonth() - 1, (c.getDate() - current.getDay() + 2));
        } else if (current.getDay() == 0) {
            var c = new Date(SELF.current.getFullYear(), SELF.current.getMonth(), 0);
            current = new Date(SELF.current.getFullYear(), SELF.current.getMonth() - 1, (c.getDate() - 5));
        } else {
            var c = new Date(SELF.current.getFullYear(), SELF.current.getMonth(), 0);
            current = new Date(SELF.current.getFullYear(), SELF.current.getMonth() - 1, (c.getDate() - 6));
        }

        var ul = $("<ul/>");

        function change(li, y) {
            li.on("click", function () {
                SELF.setYear(y);
            });
        }
        SELF.html.yearChanger.append(ul);
        for (var y = SELF.current.getFullYear() + 50; y > SELF.current.getFullYear() - 50; y--) {
            var li = $("<li/>", {
                html: SELF.translate("month", SELF.current.getMonth()) + " " + y
            });
            ul.append(li);
            change(li, y);
        }

        SELF.html.days = [];
        SELF.html.rows = [];

        SELF.html.calendar.children().remove();
        if (this.settings.showWeekHeader) {
            var rowh = $("<div/>", {
                id: this.name + "-rowh"
            });
            this.html.calendar.append(rowh);
            createHeader.call(this, "mo");
            createHeader.call(this, "tu");
            createHeader.call(this, "we");
            createHeader.call(this, "th");
            createHeader.call(this, "fr");
            createHeader.call(this, "sa");
            createHeader.call(this, "su");

            function createHeader(day) {
                var u = $("<div/>", {
                    id: this.name + "-rowh-" + day,
                    class: this.name + "-rowh",
                    html: this.translate("day", day)
                });
                rowh.append(u);
            }

        }
        while (i < 6) {
            i++;
            SELF.html.rows[i] = $('<div/>', {
                id: SELF.name + '.row-' + i,
                class: SELF.name + '-row'
            });
            SELF.html.calendar.append(SELF.html.rows[i]);
            var day = 0;
            while (day < 7) {
                day++;
                n++;
                var d = $('<div/>', {
                    id: SELF.name + '-day-' + n,
                    class: SELF.name + '-day' + ' ' + SELF.name + '-button',
                    html: current.getDate()
                }).data('date', current);

                if (current.getMonth() != SELF.current.getMonth()) d.addClass(SELF.name + '-day-extern');
                if (current.getMonth() == SELF.today.getMonth() && current.getDate() == SELF.today.getDate() && current.getFullYear() == SELF.today.getFullYear()) d.addClass(SELF.name + '-day-today');
                if (SELF.selected && current.getTime() === SELF.selected.getTime()) d.addClass(SELF.name + '-active');

                current = new Date(current.getTime() + SELF.calculate.day);
                SELF.html.days.push(d);
                SELF.html.rows[i].append(d);

            }
        }

        var width = SELF.html.body.outerWidth() / 7;
        $(SELF.html.days).each(function () {
            $(this).css({
                width: parseInt(width + 1 - parseInt($(this).css("paddingLeft")) - parseInt($(this).css("paddingRight")))
            });
        });
        $("." + this.name + "-rowh").each(function () {
            $(this).css({
                width: parseInt(width + 1 - parseInt($(this).css("paddingLeft")) - parseInt($(this).css("paddingRight")))
            });
        });

        if (this.settings.free) {
            this.html.dialog.css({
                marginTop: (window.innerHeight - this.html.dialog.outerHeight()) / 2,
                marginLeft: (window.innerWidth - this.html.dialog.outerWidth()) / 2
            });
        } else {
            this.html.dialog.css({
                position: "absolute",
                left: SELF.element.offset().left,
                top: SELF.element.offset().top + SELF.element.outerHeight()
            });
        }

        SELF.addEventListener();
        return SELF;
    };
    FancyDate.api.addEventListener = function () {
        var SELF = this;
        for (var i = 0; i < SELF.html.days.length; i++) {
            $(SELF.html.days[i]).on('click', function () {
                SELF.select(new Date($(this).data('date')));
            });
        }
        SELF.element.on("keydown", function (e) {
            setTimeout(function () {
                if ((e.which | e.keyCode) === 9) SELF.close();
            }, 2);
        });

        SELF.html.clear.unbind('click').on('click', function () {
            SELF.element.val('');
            SELF.selected = false;
            SELF.current = SELF.today;
            SELF.close();
        });

        SELF.html.dialog.unbind('.' + SELF.name).on('selectstart.' + SELF.name, function (event) {
            "use strict";
            event.preventDefault();
        });

        SELF.html.close.unbind('click').on('click', function () {
            SELF.close();
        });

        SELF.html.today.unbind('click').on('click', function () {
            SELF.select(SELF.today);
            SELF.current = SELF.today;
            SELF.close();
        });

        SELF.html.next.unbind('click').on('click', function () {
            SELF.current = new Date(SELF.current.getFullYear(), SELF.current.getMonth() + 1, 1);
            SELF.update();
        });

        SELF.html.previous.unbind('click').on('click', function () {
            SELF.current = new Date(SELF.current.getFullYear(), SELF.current.getMonth() - 1, 1);
            SELF.update();
        });

        SELF.html.wrapper.unbind('click').on('click', function (e) {
            if ($(e.target).is(SELF.html.wrapper)) {
                SELF.close();
            }
        });
        SELF.element.unbind("." + NAME).on("input." + NAME + " paste." + NAME, function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        return SELF;
    };
    FancyDate.api.select = function (date) {
        var SELF = this;
        SELF.element.val(SELF.encode(date));
        SELF.selected = date;
        SELF.current = date;
        if (typeof SELF.settings.onSelect == "function") SELF.settings.onSelect(SELF.selected);
        SELF.close();
        return SELF;
    };
    FancyDate.api.encode = function (date, format) {
        var SELF = this;
        format = format || SELF.settings.format;
        return format.replace('dd', (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())).replace('mm', (date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1))).replace('yyyy', date.getFullYear());
    };
    FancyDate.api.decode = function (date) {
        var SELF = this;
        var format = {
            d: parseInt(date.substring(SELF.settings.format.indexOf('dd'), SELF.settings.format.indexOf('dd') + 2)),
            m: parseInt(date.substring(SELF.settings.format.indexOf('mm'), SELF.settings.format.indexOf('mm') + 2)) - 1,
            y: parseInt(date.substring(SELF.settings.format.indexOf('yyyy'), SELF.settings.format.indexOf('yyyy') + 4))
        };
        return new Date(format.y, format.m, format.d);
    };
    FancyDate.api.translate = function (key, value) {
        var l = FancyDate.translation[navigator.language] ? navigator.language : 'en',
            t = FancyDate.translation[l][key];
        if (typeof t[0] == "undefined" && typeof value == "number") {
            value = findByKey(t, value);
        }
        if (t) t = FancyDate.translation[l][key][value];
        return t;
    };
    FancyDate.api.setYear = function (year) {
        this.current.setYear(year);
        this.create();
    }

    Fancy.settings[NAME] = {
        format: 'dd.mm.yyyy',
        animated: true,
        onShow: function () {},
        onClose: function () {},
        query: function () {
            return true;
        },
        free: true,
        showWeekHeader: true
    };

    FancyDate.translation = {
        de: {
            month: ['Januar', 'Februar', 'M&auml;rz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            day: {
                mon: "Montag",
                mo: "Mo",
                tue: "Dienstag",
                tu: "Di",
                wen: "Mittwoch",
                we: "Mi",
                thu: "Donnerstag",
                th: "Do",
                fri: "Freitag",
                fr: "Fr",
                sat: "Samstag",
                sa: "Sa",
                sun: "Sonntag",
                su: "So"
            },
            button: {
                close: 'Schlie&szlig;en',
                today: 'Heute',
                clear: 'L&ouml;schen'
            }
        },
        en: {
            month: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            day: {
                mon: 'Mon',
                tue: 'Tue',
                wen: 'Wed',
                thu: 'Thu',
                fri: 'Fri',
                sat: 'Sat',
                sun: 'Sun'
            },
            button: {
                close: 'Close',
                today: 'Today',
                clear: 'Clear'
            }
        }
    };
    Fancy.date = true;
    Fancy.api.date = function (settings) {
        return this.set(FancyDate, settings);
    };

})(window, jQuery);