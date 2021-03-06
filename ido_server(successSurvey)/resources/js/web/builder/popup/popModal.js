/*
popModal - 1.23 [11.04.16]
Author: vadimsva
Github: https://github.com/vadimsva/popModal
*/
$(function() {
/* dialogModal */
(function($) {
	$.fn.dialogModal = function(method) {
		var elem = $(this),
		elemObj,
		elemClass = 'dialogModal',
		prevBut = 'dialogPrev',
		nextBut = 'dialogNext',
		_options,
		animTime;
	
		var methods = {
			init : function(params) {
				var _defaults = {
					topOffset: 0,
					top: '10%',
					type: '',
					onOkBut: function() {return true;},
					onCancelBut: function() {},
					onLoad: function() {},
					onClose: function() {},
					onChange: function() {}
				};
				_options = $.extend(_defaults, params);

				$('html.' + elemClass + 'Open').off('.' + elemClass + 'Event').removeClass(elemClass + 'Open');
				$('.' + elemClass + ' .' + prevBut + ', .' + elemClass + ' .' + nextBut).off('click');
				$('.' + elemClass).remove();

				if (_options.type == '') {
					_options.top = 0;
				} else {
					_options.top = 'calc(' + _options.top + ' + 60px)';
				}
				
				var currentDialog = 0,
				maxDialog = elem.length - 1,
				dialogMain = $('<div class="' + elemClass + ' ' + _options.type + '" style="top:' + _options.topOffset + 'px"></div>'),
				dialogContainer = $('<div class="' + elemClass + '_container" style="top:' + _options.top + '"></div>'),
				dialogTop = $('<div class="' + elemClass + '_top animated"></div>'),
				dialogHeader = $('<div class="' + elemClass + '_header"></div>'),
				dialogBody = $('<div class="' + elemClass + '_body animated"></div>'),
				dialogCloseBut = $('<button type="button" class="close">&times;</button>');
				dialogMain.append(dialogContainer);
				dialogContainer.append(dialogTop, dialogBody);
				dialogTop.append(dialogHeader);
				dialogHeader.append(dialogCloseBut);
				dialogBody.append(elem[currentDialog].innerHTML);
				console.log(elem[currentDialog].innerHTML);



				if (maxDialog > 0) {
					dialogHeader.append($('<div class="' + nextBut + '">&rsaquo;</div><div class="' + prevBut + ' notactive">&lsaquo;</div>'));
				}
				dialogHeader.append('<span>' + elem.find('.' + elemClass + '_header')[currentDialog].innerHTML + '</span>');
				
				$('body').append(dialogMain).addClass(elemClass + 'Open');
				if (_options.type == '') {
					var getScrollBarWidth = dialogMain.outerWidth() - dialogMain[0].scrollWidth;
					dialogTop.css({right:getScrollBarWidth + 'px'});
				}
				
				elemObj = $('.' + elemClass);
				getAnimTime();

				if (_options.onLoad && $.isFunction(_options.onLoad)) {
					_options.onLoad(elemObj, currentDialog + 1);
				}
				elem.trigger('load', {el: elemObj, current: currentDialog + 1});

				elemObj.on('destroyed', function() {
					if (_options.onClose && $.isFunction(_options.onClose)) {
						_options.onClose();
					}
					elem.trigger('close');
				});
				
				elemObj.addClass('open');
				setTimeout(function() {
					if (_options.type != '') {
						dialogContainer.css({opacity:1});
					}
					dialogTop.addClass('fadeInTopBig');
					dialogBody.addClass('fadeInTopBig');
				}, animTime + 100);
				
				bindFooterButtons();
				
				elemObj.find('#thumbnailFileBtn').on('click', function() {
					console.log('ff');
				});	

				function bindFooterButtons() {
					elemObj.find('[data-dialogmodal-but="close"]').on('click', function() {
						dialogModalClose();
						$(this).off('click');
					});

					elemObj.find('[data-dialogmodal-but="ok"]').on('click', function(event) {
						var ok;
						if (_options.onOkBut && $.isFunction(_options.onOkBut)) {
							ok = _options.onOkBut(event);
						}
						if (ok !== false) {
							dialogModalClose();
						}
						$(this).off('click');
						elem.trigger('okbut');
					});

					elemObj.find('[data-dialogmodal-but="cancel"]').on('click', function() {
						if (_options.onCancelBut && $.isFunction(_options.onCancelBut)) {
							_options.onCancelBut();
						}
						dialogModalClose();
						$(this).off('click');
						elem.trigger('cancelbut');
					});
					
					elemObj.find('[data-dialogmodal-but="prev"]').on('click', function() {
						elemObj.find('.' + prevBut).click();
					});
					
					elemObj.find('[data-dialogmodal-but="next"]').on('click', function() {
						elemObj.find('.' + nextBut).click();
					});
				}

				elemObj.find('.' + prevBut).on('click', function() {
					if (currentDialog > 0) {
						--currentDialog;
						if (currentDialog < maxDialog) {
							elemObj.find('.' + nextBut).removeClass('notactive');
						}
						if (currentDialog === 0) {
							elemObj.find('.' + prevBut).addClass('notactive');
						}
						changeDialogContent();
					}
				});
				
				elemObj.find('.' + nextBut).on('click', function() {
					if (currentDialog < maxDialog) {
						++currentDialog;
						if (currentDialog > 0) {
							elemObj.find('.' + prevBut).removeClass('notactive');
						}
						if (currentDialog == maxDialog) {
							elemObj.find('.' + nextBut).addClass('notactive');
						}
						changeDialogContent();
					}
				});
				
				function changeDialogContent() {
					console.log(elem[currentDialog].innerHTML);
					dialogBody.empty().append(elem[currentDialog].innerHTML);
					dialogHeader.find('span').html(elem.find('.' + elemClass + '_header')[currentDialog].innerHTML);
					bindFooterButtons();
					if (_options.onChange && $.isFunction(_options.onChange)) {
						_options.onChange(elemObj, currentDialog + 1);
					}
					elem.trigger('change', {el: elemObj, current: currentDialog + 1});
				}

				elemObj.find('.close').on('click', function() {
					dialogModalClose();
					$(this).off('click');
				});
				
				$('html').on('keydown.' + elemClass + 'Event', function(event) {
					if (event.keyCode == 27) {
						dialogModalClose();
					} else if (event.keyCode == 37) {
						elemObj.find('.' + prevBut).click();
					} else if (event.keyCode == 39) {
						elemObj.find('.' + nextBut).click();
					}
				});
					
			},
			hide : function() {
				dialogModalClose();
			}
		};
		
		function dialogModalClose() {
		var elemObj = $('.' + elemClass);
			elemObj.removeClass('open');
			setTimeout(function() {
				elemObj.remove();
				$('body').removeClass(elemClass + 'Open').css({paddingRight:''});
				$('html.' + elemClass + 'Open').off('.' + elemClass + 'Event').removeClass(elemClass + 'Open');
				elemObj.find('.' + prevBut).off('click');
				elemObj.find('.' + nextBut).off('click');
			}, animTime);
		}
		
		function getAnimTime() {
			if (!animTime) {
				animTime = elemObj.css('transitionDuration');
				if (animTime !== undefined) {
					animTime = animTime.replace('s', '') * 1000;
				} else {
					animTime = 0;
				}
			}
		}

		if (methods[method]) {
			return methods[method].apply( this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return methods.init.apply( this, arguments );
		}

	};
	
	$('* [data-dialogmodal-bind]').bind('click', function() {
		var elemBind = $(this).attr('data-dialogmodal-bind');
		var params = {};
		if ($(this).attr('data-topoffset') !== undefined) {
			params['topOffset'] = $(this).attr('data-topoffset');
		}
		if ($(this).attr('data-top') !== undefined) {
			params['top'] = $(this).attr('data-top');
		}
		if ($(this).attr('data-topoffset') !== undefined) {
			params['type'] = $(this).attr('data-type');
		}
		$(elemBind).dialogModal(params);
	});

  $.event.special.destroyed = {
    remove: function(o) {
      if (o.handler) {
        o.handler();
      }
    }
  };
})(jQuery);
});
