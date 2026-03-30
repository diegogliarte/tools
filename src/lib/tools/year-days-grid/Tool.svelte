<script lang="ts">
	import ProgressBar from '$lib/components/ui/progress-bar.svelte';

	const year = new Date().getFullYear();
	const today = new Date();

	function daysInYear(y: number) {
		return new Date(y, 11, 31).getDate() === 31 ? 365 + (new Date(y, 1, 29).getMonth() === 1 ? 1 : 0) : 365;
	}

	const totalDays = daysInYear(year);

	function dayOfYear(date: Date) {
		const start = new Date(date.getFullYear(), 0, 0);
		const diff =
			date.getTime() -
			start.getTime() +
			(start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
		return Math.floor(diff / 86400000);
	}

	const passedDays =
		year < today.getFullYear()
			? totalDays
			: year > today.getFullYear()
				? 0
				: dayOfYear(today);

	const now = new Date();

	const dayProgress =
		(now.getHours() * 3600 +
			now.getMinutes() * 60 +
			now.getSeconds()) / 86400;

	const week = ((passedDays - 1 + dayProgress) / 7).toFixed(2);

</script>

<h2 class="text-center font-semibold text-large">
	{year}
</h2>

<ProgressBar
	label="Year progress"
	value={passedDays}
	min={0}
	max={totalDays}
	showValue={false}
/>

<div>Current Week <span class="text-accent">{week}</span></div>

<div class="flex justify-center">
	<div
		class="grid gap-1 w-full max-w-xl"
		style="grid-template-columns: repeat(7, 1fr);"
	>
		{#each Array(totalDays) as _, i (i)}
			{@const day = i + 1}
			{@const isToday = day === passedDays}

			<div
				class="
					relative
					aspect-square
					border
					flex items-center justify-center
					select-none
					text-xs
					overflow-hidden
					{day < passedDays
						? 'bg-accent text-text border-accent'
						: 'text-text'}
					{isToday ? 'border-accent' : ''}
				"
			>
				{#if isToday}
					<div
						class="absolute left-0 top-0 h-full bg-accent"
						style={`width: ${dayProgress * 100}%`}
					></div>
				{/if}

				<span class="relative z-10">
					{day}
				</span>
			</div>
		{/each}
	</div>
</div>
