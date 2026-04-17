const apexImageSlider = function (apex, $) {
    "use strict";
    const util = {
        featureDetails: {
            name: "APEX Lazy Image Slider",
            scriptVersion: "25.01.05",
            utilVersion: "22.11.28",
            url: "https://github.com/RonnyWeiss",
            license: "MIT"
        },
        isDefinedAndNotNull: function (pInput) {
            if (typeof pInput !== "undefined" && pInput !== null && pInput !== "") {
                return true;
            } else {
                return false;
            }
        },
        link: function (pLink, pTarget = "_parent") {
            if (typeof pLink !== "undefined" && pLink !== null && pLink !== "") {
                window.open(pLink, pTarget);
            }
        },
        loader: {
            start: function (id, setMinHeight) {
                if (setMinHeight) {
                    $(id).css("min-height", "100px");
                }
                apex.util.showSpinner($(id));
            },
            stop: function (id, removeMinHeight) {
                if (removeMinHeight) {
                    $(id).css("min-height", "");
                }
                $(id + " > .u-Processing").remove();
                $(id + " > .ct-loader").remove();
            }
        },
        printDOMMessage: {
            show: function (id, text, icon, color) {
                const div = $("<div>");
                if ($(id).height() >= 150) {
                    const subDiv = $("<div></div>");

                    const iconSpan = $("<span></span>")
                        .addClass("fa")
                        .addClass(icon || "fa-info-circle-o")
                        .addClass("fa-2x")
                        .css("height", "32px")
                        .css("width", "32px")
                        .css("margin-bottom", "16px")
                        .css("color", color || "#D0D0D0");

                    subDiv.append(iconSpan);

                    const textSpan = $("<span></span>")
                        .text(text)
                        .css("display", "block")
                        .css("color", "#707070")
                        .css("text-overflow", "ellipsis")
                        .css("overflow", "hidden")
                        .css("white-space", "nowrap")
                        .css("font-size", "12px");

                    div
                        .css("margin", "12px")
                        .css("text-align", "center")
                        .css("padding", "10px 0")
                        .addClass("dominfomessagediv")
                        .append(subDiv)
                        .append(textSpan);
                } else {
                    const iconSpan = $("<span></span>")
                        .addClass("fa")
                        .addClass(icon || "fa-info-circle-o")
                        .css("font-size", "22px")
                        .css("line-height", "26px")
                        .css("margin-right", "5px")
                        .css("color", color || "#D0D0D0");

                    const textSpan = $("<span></span>")
                        .text(text)
                        .css("color", "#707070")
                        .css("text-overflow", "ellipsis")
                        .css("overflow", "hidden")
                        .css("white-space", "nowrap")
                        .css("font-size", "12px")
                        .css("line-height", "20px");

                    div
                        .css("margin", "10px")
                        .css("text-align", "center")
                        .addClass("dominfomessagediv")
                        .append(iconSpan)
                        .append(textSpan);
                }
                $(id).append(div);
            },
            hide: function (id) {
                $(id).children(".dominfomessagediv").remove();
            }
        },
        noDataMessage: {
            show: function (id, text) {
                util.printDOMMessage.show(id, text, "fa-search");
            },
            hide: function (id) {
                util.printDOMMessage.hide(id);
            }
        },
        errorMessage: {
            show: function (id, text) {
                util.printDOMMessage.show(id, text, "fa-exclamation-triangle", "#FFCB3D");
            },
            hide: function (id) {
                util.printDOMMessage.hide(id);
            }
        }
    };

    /***********************************************************************
     **
     ** Used to draw the region
     **
     ***********************************************************************/
    function drawSlideRegion(pData, pConfigJSON) {

        apex.debug.info({
            "fct": util.featureDetails.name + " - drawSlideRegion",
            "pData": pData,
            "featureDetails": util.featureDetails
        });

        if (pData.row && pData.row.length > 0) {
            const itemData = pData.row;
            let htmlIDX = 0,
                timeOut;

            if (pConfigJSON.firstImageIDItem) {
                const item = apex.item(pConfigJSON.firstImageIDItem)

                if (item) {
                    const value = item.getValue();

                    if (value) {
                        function findIndexById(array, id) {
                            return array.findIndex(item => ("" + item.SRC_VALUE) === ("" + id));
                        }
                        htmlIDX = findIndexById(itemData, value);
                    }
                }
            }

            let htmlDiv = $("<div></div>");
            htmlDiv.addClass("swiper-item-html-container");
            htmlDiv.attr("id", pConfigJSON.regionID + "-sd");
            htmlDiv.css("background-color", pConfigJSON.backgroundColor || "transparent");

            $(pConfigJSON.parentIDSelector).append(htmlDiv);

            function prepareHTMLRender() {
                htmlDiv.find(".swiper-img-container").remove();

                let imgDiv = $("<div></div>");
                imgDiv.addClass("swiper-img-container");
                imgDiv.css("background-size", pConfigJSON.imageSize);
                imgDiv.hide();

                htmlDiv.prepend(imgDiv);

                if (htmlIDX > (itemData.length - 1)) {
                    htmlIDX = 0;
                } else if (htmlIDX < 0) {
                    htmlIDX = itemData.length - 1;
                }

                if (itemData[htmlIDX]) {
                    const item = itemData[htmlIDX];

                    if (util.isDefinedAndNotNull(item.LINK)) {
                        imgDiv.css("cursor", "pointer");
                        imgDiv.on("click", function () {
                            util.link(item.LINK);
                        });
                    }

                    if (util.isDefinedAndNotNull(item.SRC_TITLE)) {
                        let imgTitle = $("<h3></h3>");
                        imgTitle.addClass("swiper-img-title");
                        if (pConfigJSON.escapeHTMLRequired) {
                            imgTitle.text(item.SRC_TITLE);
                        } else {
                            imgTitle.html(item.SRC_TITLE);
                        }
                        imgDiv.append(imgTitle);
                    }

                    let imgSRC = item.SRC_VALUE;

                    if (item.SRC_TYPE === "blob") {
                        const items2SubmitBlob = pConfigJSON.items2SubmitBlob;

                        imgSRC = apex.server.pluginUrl(pConfigJSON.ajaxID, {
                            x01: "GET_IMAGE",
                            x02: imgSRC,
                            pageItems: items2SubmitBlob
                        });
                    }

                    imgDiv.css("background-image", "url(" + imgSRC + ")");

                    $(imgDiv).fadeIn("fast");

                    /* make it auto play when duration is set */
                    if (pData.row.length > 1) {
                        const cur = item,
                            dur = cur.DURATION;

                        if (dur && dur > 0) {
                            function setTimeOut(pPreventSetIDX) {
                                timeOut = setTimeout(function () {
                                    htmlIDX++;
                                    $(imgDiv).fadeOut("fast", function () {
                                        prepareHTMLRender();
                                    });
                                }, dur * 1000);
                            }

                            $(htmlDiv).hover(function () {
                                clearTimeout(timeOut);
                            });

                            $(htmlDiv).mouseleave(function () {
                                setTimeOut();
                            });

                            setTimeOut();
                        }
                    }
                }
            }

            /* go to next img */
            function goDown() {
                htmlIDX++;
                clearTimeout(timeOut);
                $(htmlDiv).find(".swiper-img-container").fadeOut("fast", function () {
                    prepareHTMLRender();
                });
            }

            /* go to previous img */
            function goUp() {
                htmlIDX--;
                clearTimeout(timeOut);
                $(htmlDiv).find(".swiper-img-container").fadeOut("fast", function () {
                    prepareHTMLRender();
                });
            }

            /* bind mouswheel */
            if ($.inArray("mousewheel", pConfigJSON.controls) >= 0 && pData.row.length > 1) {
                $(pConfigJSON.parentIDSelector).bind("mousewheel DOMMouseScroll", function (event) {
                    event.preventDefault();
                    if (event.originalEvent.wheelDelta >= 0) {
                        goUp();
                    } else {
                        goDown()
                    }
                });
            }

            /* bind arrow keys */
            if ($.inArray("keyboard", pConfigJSON.controls) >= 0 && pData.row.length > 1) {
                $("body").keydown(function (e) {
                    if (e.keyCode === 37) {
                        goUp();
                    } else if (e.keyCode === 39) {
                        goDown();
                    }
                });
            }

            /* add control buttons for slide */
            if ($.inArray("arrows", pConfigJSON.controls) >= 0 && pData.row.length > 1) {
                let leftControl = $("<div></div>");
                leftControl.addClass("swiper-item-html-slide-lc");
                leftControl.on("click", function () {
                    goUp()
                });

                let leftControlIcon = $("<span></span>");
                leftControlIcon.addClass("fa fa-chevron-left fa-lg");
                leftControlIcon.addClass("swiper-item-html-slide-lc-s");
                leftControl.append(leftControlIcon);

                $(htmlDiv).append(leftControl);

                let rightControl = $("<div></div>");
                rightControl.addClass("swiper-item-html-slide-rc");
                rightControl.on("click", function () {
                    goDown();
                });

                let rightControlIcon = $("<span></span>");
                rightControlIcon.addClass("fa fa-chevron-right fa-lg");
                rightControlIcon.addClass("swiper-item-html-slide-rc-s");
                rightControl.append(rightControlIcon);

                /* append control buttons */
                $(htmlDiv).append(rightControl);
            }

            /* render imgages */
            prepareHTMLRender();

            util.loader.stop(pConfigJSON.parentIDSelector);

        } else {
            util.noDataMessage.show(pConfigJSON.parentIDSelector, pConfigJSON.noDataMessage);
        }
    }

    /***********************************************************************
     **
     ** Used to get data from server
     **
     ***********************************************************************/
    function getData(pConfigJSON) {
        const items2Submit = pConfigJSON.item2Submit;

        /* cleanup */
        $(pConfigJSON.parentIDSelector).empty();
        apex.server.plugin(
            pConfigJSON.ajaxID, {
            x01: "GET_SQL_SOURCE",
            pageItems: items2Submit
        }, {
            success: function (pData) {
                drawSlideRegion(pData, pConfigJSON);
            },
            error: function (d) {
                util.noDataMessage.show(pConfigJSON.parentIDSelector, "Error occured!");
                apex.debug.error({
                    "fct": util.featureDetails.name + " - getData",
                    "msg": "Error while loading AJAX data",
                    "err": d,
                    "featureDetails": util.featureDetails
                });
            },
            dataType: "json"
        });
    }

    return {
        /***********************************************************************
         **
         ** Initial function
         **
         ***********************************************************************/
        initialize: function (
            pRegionID,
            pAjaxID,
            pNoDataMessage,
            pImageHeight,
            pImageSize,
            pBackgroundColor,
            pControls,
            pItems2Submit,
            pItems2SubmitBlob,
            pFirstImageIDItem,
            pRequireHTMLEscape
        ) {

            apex.debug.info({
                "fct": util.featureDetails.name + " - initialize",
                "config": {
                    "pRegionID": pRegionID,
                    "pAjaxID": pAjaxID,
                    "pNoDataMessage": pNoDataMessage,
                    "pImageHeight": pImageHeight,
                    "pImageSize": pImageSize,
                    "pBackgroundColor": pBackgroundColor,
                    "pItems2Submit": pItems2Submit,
                    "pItems2SubmitBlob": pItems2SubmitBlob,
                    "pRequireHTMLEscape": pRequireHTMLEscape,
                    "pFirstImageIDItem": pFirstImageIDItem,
                    "pControls": pControls
                },
                "featureDetails": util.featureDetails
            });

            let configJSON = {};

            configJSON.imageHeight = pImageHeight;
            configJSON.imageSize = pImageSize;
            configJSON.backgroundColor = pBackgroundColor;
            configJSON.ajaxID = pAjaxID;
            configJSON.parentIDSelector = "#" + pRegionID + "-is";
            configJSON.regionID = pRegionID;
            configJSON.noDataMessage = pNoDataMessage;
            configJSON.item2Submit = pItems2Submit;
            configJSON.items2SubmitBlob = pItems2SubmitBlob;
            configJSON.firstImageIDItem = pFirstImageIDItem;
            configJSON.controls = pControls.split(":");
            configJSON.escapeHTMLRequired = true;

            $(configJSON.parentIDSelector).css("height", configJSON.imageHeight);

            util.loader.start(configJSON.parentIDSelector);

            if (pRequireHTMLEscape === false) {
                configJSON.escapeHTMLRequired = false;
            }

            getData(configJSON);

            // bind refresh event
            $("#" + pRegionID).bind("apexrefresh", function () {
                getData(configJSON);
            });
        }
    };
};
