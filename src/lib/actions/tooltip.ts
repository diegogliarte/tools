import type { Action } from 'svelte/action';

interface TooltipParams {
	text: string;
	delay?: number;
	position?: 'top' | 'bottom' | 'left' | 'right';
	trigger?: 'hover' | 'click' | 'both';
	disabled?: boolean;
}

export const tooltipAction: Action<HTMLElement, TooltipParams> = (node, params) => {
	let { text, delay = 0, position = 'top', trigger = 'hover', disabled = false } = params ?? {};
	let timer: ReturnType<typeof setTimeout>;
	let el: HTMLDivElement | null = null;
	let isVisible = false;
	const VIEWPORT_PADDING = 8;
	const TOOLTIP_GAP = 4;

	function positionOrder(preferred: TooltipParams['position']) {
		switch (preferred) {
			case 'bottom':
				return ['bottom', 'top', 'right', 'left'] as const;
			case 'left':
				return ['left', 'right', 'top', 'bottom'] as const;
			case 'right':
				return ['right', 'left', 'top', 'bottom'] as const;
			case 'top':
			default:
				return ['top', 'bottom', 'right', 'left'] as const;
		}
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	function getCoords(
		targetRect: DOMRect,
		tooltipRect: DOMRect,
		side: NonNullable<TooltipParams['position']>
	) {
		switch (side) {
			case 'bottom':
				return {
					left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
					top: targetRect.bottom + TOOLTIP_GAP
				};
			case 'left':
				return {
					left: targetRect.left - tooltipRect.width - TOOLTIP_GAP,
					top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
				};
			case 'right':
				return {
					left: targetRect.right + TOOLTIP_GAP,
					top: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2
				};
			case 'top':
			default:
				return {
					left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
					top: targetRect.top - tooltipRect.height - TOOLTIP_GAP
				};
		}
	}

	function fitsViewport(left: number, top: number, tooltipRect: DOMRect) {
		return (
			left >= VIEWPORT_PADDING &&
			top >= VIEWPORT_PADDING &&
			left + tooltipRect.width <= window.innerWidth - VIEWPORT_PADDING &&
			top + tooltipRect.height <= window.innerHeight - VIEWPORT_PADDING
		);
	}

	function updatePosition() {
		if (!el) return;

		const targetRect = node.getBoundingClientRect();
		const tooltipRect = el.getBoundingClientRect();
		const candidates = positionOrder(position);

		let selected = getCoords(targetRect, tooltipRect, candidates[0]);

		for (const side of candidates) {
			const coords = getCoords(targetRect, tooltipRect, side);
			if (fitsViewport(coords.left, coords.top, tooltipRect)) {
				selected = coords;
				break;
			}
		}

		const maxLeft = Math.max(VIEWPORT_PADDING, window.innerWidth - tooltipRect.width - VIEWPORT_PADDING);
		const maxTop = Math.max(VIEWPORT_PADDING, window.innerHeight - tooltipRect.height - VIEWPORT_PADDING);

		el.style.left = `${clamp(selected.left, VIEWPORT_PADDING, maxLeft)}px`;
		el.style.top = `${clamp(selected.top, VIEWPORT_PADDING, maxTop)}px`;
	}

	function show() {
		if (disabled || !text || isVisible) return;
		isVisible = true;

		el = document.createElement('div');
		el.innerHTML = text.replace(/\n/g, '<br>');

		el.className = `
            fixed z-50
            px-3 py-2
            border bg-bg
            text-xs
            whitespace-nowrap
            pointer-events-none
        `;
		el.style.maxWidth = `min(20rem, calc(100vw - ${VIEWPORT_PADDING * 2}px))`;
		document.body.appendChild(el);
		updatePosition();
	}

	function hide() {
		if (!isVisible) return;
		isVisible = false;

		if (el) el.remove();
		el = null;
	}

	function handleEnter() {
		if (trigger === 'hover' || trigger === 'both') {
			timer = setTimeout(show, delay);
		}
	}

	function handleLeave() {
		clearTimeout(timer);
		hide();
	}

	function handleClick() {
		if (trigger === 'click' || trigger === 'both') {
			isVisible ? hide() : show();
		}
	}

	function handleViewportChange() {
		if (isVisible) updatePosition();
	}

	node.addEventListener('mouseenter', handleEnter);
	node.addEventListener('mouseleave', handleLeave);
	node.addEventListener('click', handleClick);
	window.addEventListener('resize', handleViewportChange);
	window.addEventListener('scroll', handleViewportChange, true);

	return {
		update(newParams) {
			text = newParams?.text;
			delay = newParams?.delay ?? delay;
			position = newParams?.position ?? position;
			trigger = newParams?.trigger ?? trigger;
			disabled = newParams?.disabled ?? disabled;
			if (isVisible) updatePosition();
		},

		destroy() {
			node.removeEventListener('mouseenter', handleEnter);
			node.removeEventListener('mouseleave', handleLeave);
			node.removeEventListener('click', handleClick);
			window.removeEventListener('resize', handleViewportChange);
			window.removeEventListener('scroll', handleViewportChange, true);
			hide();
		}
	};
};
