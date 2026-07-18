import type { Action } from 'svelte/action';

interface TooltipParams {
	text: string;
	delay?: number;
	position?: 'top' | 'bottom' | 'left' | 'right';
	trigger?: 'hover' | 'click' | 'both';
	disabled?: boolean;
	open?: boolean;
	interactive?: boolean;
	onTooltipClick?: () => void;
}

type Side = NonNullable<TooltipParams['position']>;

const VIEWPORT_PADDING = 8;
const TOOLTIP_GAP = 12;
const ARROW_SIZE = 12;
const BORDER_COLOR = 'var(--color-text)';
const HOVER_BORDER_COLOR = 'var(--color-accent)';
const BACKGROUND_COLOR = 'var(--color-bg)';

export const tooltipAction: Action<HTMLElement, TooltipParams> = (node, params) => {
	let {
		text,
		delay = 0,
		position = 'top',
		trigger = 'hover',
		disabled = false,
		open = false,
		interactive = false,
		onTooltipClick
	} = params ?? {};

	let timer: ReturnType<typeof setTimeout> | undefined;
	let tooltipEl: HTMLDivElement | null = null;
	let arrowEl: HTMLDivElement | null = null;
	let isVisible = false;

	function positionOrder(preferred: Side) {
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

	function getCoords(targetRect: DOMRect, tooltipRect: DOMRect, side: Side) {
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

	function setArrowColor(color: string) {
		if (!arrowEl) return;

		switch (arrowEl.dataset.side as Side) {
			case 'bottom':
				arrowEl.style.borderTopColor = color;
				arrowEl.style.borderLeftColor = color;
				break;
			case 'left':
				arrowEl.style.borderTopColor = color;
				arrowEl.style.borderRightColor = color;
				break;
			case 'right':
				arrowEl.style.borderBottomColor = color;
				arrowEl.style.borderLeftColor = color;
				break;
			case 'top':
			default:
				arrowEl.style.borderRightColor = color;
				arrowEl.style.borderBottomColor = color;
				break;
		}
	}

	function applyArrowPosition(side: Side, targetRect: DOMRect, tooltipRect: DOMRect) {
		if (!arrowEl) return;

		arrowEl.dataset.side = side;
		arrowEl.style.position = 'absolute';
		arrowEl.style.width = `${ARROW_SIZE}px`;
		arrowEl.style.height = `${ARROW_SIZE}px`;
		arrowEl.style.background = BACKGROUND_COLOR;
		arrowEl.style.transform = 'rotate(45deg)';
		arrowEl.style.border = '0 solid transparent';
		arrowEl.style.top = '';
		arrowEl.style.right = '';
		arrowEl.style.bottom = '';
		arrowEl.style.left = '';

		switch (side) {
			case 'bottom':
				arrowEl.style.right = '';
				arrowEl.style.top = `${-ARROW_SIZE / 2}px`;
				arrowEl.style.left = `${clamp(
					targetRect.left + targetRect.width / 2 - tooltipRect.left - ARROW_SIZE / 2,
					ARROW_SIZE,
					tooltipRect.width - ARROW_SIZE * 2
				)}px`;
				arrowEl.style.borderTopWidth = '1px';
				arrowEl.style.borderLeftWidth = '1px';
				break;
			case 'left':
				arrowEl.style.left = '';
				arrowEl.style.top = '50%';
				arrowEl.style.right = `${-ARROW_SIZE / 2}px`;
				arrowEl.style.transform = 'translateY(-50%) rotate(45deg)';
				arrowEl.style.borderTopWidth = '1px';
				arrowEl.style.borderRightWidth = '1px';
				break;
			case 'right':
				arrowEl.style.right = '';
				arrowEl.style.top = '50%';
				arrowEl.style.left = `${-ARROW_SIZE / 2}px`;
				arrowEl.style.transform = 'translateY(-50%) rotate(45deg)';
				arrowEl.style.borderBottomWidth = '1px';
				arrowEl.style.borderLeftWidth = '1px';
				break;
			case 'top':
			default:
				arrowEl.style.right = '';
				arrowEl.style.bottom = `${-ARROW_SIZE / 2}px`;
				arrowEl.style.left = `${clamp(
					targetRect.left + targetRect.width / 2 - tooltipRect.left - ARROW_SIZE / 2,
					ARROW_SIZE,
					tooltipRect.width - ARROW_SIZE * 2
				)}px`;
				arrowEl.style.borderRightWidth = '1px';
				arrowEl.style.borderBottomWidth = '1px';
				break;
		}

		setArrowColor(BORDER_COLOR);
	}

	function updatePosition() {
		if (!tooltipEl) return;

		const targetRect = node.getBoundingClientRect();
		const tooltipRect = tooltipEl.getBoundingClientRect();
		const candidates = positionOrder(position);

		let chosenSide = candidates[0];
		let chosenCoords = getCoords(targetRect, tooltipRect, chosenSide);

		for (const side of candidates) {
			const coords = getCoords(targetRect, tooltipRect, side);
			if (fitsViewport(coords.left, coords.top, tooltipRect)) {
				chosenSide = side;
				chosenCoords = coords;
				break;
			}
		}

		const maxLeft = Math.max(VIEWPORT_PADDING, window.innerWidth - tooltipRect.width - VIEWPORT_PADDING);
		const maxTop = Math.max(VIEWPORT_PADDING, window.innerHeight - tooltipRect.height - VIEWPORT_PADDING);

		tooltipEl.style.left = `${clamp(chosenCoords.left, VIEWPORT_PADDING, maxLeft)}px`;
		tooltipEl.style.top = `${clamp(chosenCoords.top, VIEWPORT_PADDING, maxTop)}px`;
		const finalTooltipRect = tooltipEl.getBoundingClientRect();
		applyArrowPosition(chosenSide, targetRect, finalTooltipRect);
	}

	function createTooltip() {
		tooltipEl = document.createElement('div');
		tooltipEl.innerHTML = text.replace(/\n/g, '<br>');
		tooltipEl.style.position = 'fixed';
		tooltipEl.style.zIndex = '50';
		tooltipEl.style.padding = '8px 12px';
		tooltipEl.style.border = `1px solid ${BORDER_COLOR}`;
		tooltipEl.style.background = BACKGROUND_COLOR;
		tooltipEl.style.fontSize = '12px';
		tooltipEl.style.lineHeight = '1.35';
		tooltipEl.style.whiteSpace = 'pre-line';
		tooltipEl.style.maxWidth = 'min(20rem, calc(100vw - 16px))';
		tooltipEl.style.boxSizing = 'border-box';
		tooltipEl.style.pointerEvents = interactive ? 'auto' : 'none';
		tooltipEl.style.cursor = interactive ? 'pointer' : 'default';

		arrowEl = document.createElement('div');
		tooltipEl.appendChild(arrowEl);

		if (interactive) {
			tooltipEl.addEventListener('mouseenter', () => {
				if (!tooltipEl) return;
				tooltipEl.style.borderColor = HOVER_BORDER_COLOR;
				setArrowColor(HOVER_BORDER_COLOR);
			});
			tooltipEl.addEventListener('mouseleave', () => {
				if (!tooltipEl) return;
				tooltipEl.style.borderColor = BORDER_COLOR;
				setArrowColor(BORDER_COLOR);
			});
			tooltipEl.addEventListener('click', () => {
				onTooltipClick?.();
				hide();
			});
		}

		document.body.appendChild(tooltipEl);
	}

	function show() {
		if (disabled || !text || isVisible) return;
		isVisible = true;
		createTooltip();
		updatePosition();
	}

	function hide() {
		clearTimeout(timer);
		if (!isVisible) return;
		isVisible = false;
		tooltipEl?.remove();
		tooltipEl = null;
		arrowEl = null;
	}

	function handleEnter() {
		if (trigger === 'hover' || trigger === 'both') {
			timer = setTimeout(show, delay);
		}
	}

	function handleLeave() {
		clearTimeout(timer);
		if (!open) hide();
	}

	function handleClick() {
		if (open) return;
		if (trigger === 'click' || trigger === 'both') {
			if (isVisible) hide();
			else show();
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

	if (open) show();

	return {
		update(newParams) {
			text = newParams?.text ?? text;
			delay = newParams?.delay ?? delay;
			position = newParams?.position ?? position;
			trigger = newParams?.trigger ?? trigger;
			disabled = newParams?.disabled ?? disabled;
			open = newParams?.open ?? open;
			interactive = newParams?.interactive ?? interactive;
			onTooltipClick = newParams?.onTooltipClick ?? onTooltipClick;

			if (!open && isVisible && trigger !== 'click') {
				hide();
			} else if (open && !isVisible) {
				show();
			}

			if (tooltipEl) {
				tooltipEl.innerHTML = text.replace(/\n/g, '<br>');
				if (arrowEl) tooltipEl.appendChild(arrowEl);
				tooltipEl.style.pointerEvents = interactive ? 'auto' : 'none';
				tooltipEl.style.cursor = interactive ? 'pointer' : 'default';
				updatePosition();
			}
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
