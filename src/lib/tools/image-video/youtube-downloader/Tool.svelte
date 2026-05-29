<script lang="ts">
	import TextInput from '$lib/components/ui/text-input.svelte';
	import LabeledRow from '$lib/components/ui/labeled-row.svelte';

	type Command = {
		label: string;
		value: string;
	};

	type Section = {
		title: string;
		commands: Command[];
	};

	let url = $state('');

	const hasUrl = $derived(url.trim().length > 0);
	const quotedUrl = $derived(`"${url.trim().replaceAll('"', '\\"')}"`);

	const installSections = [
		{
			title: 'Install',
			commands: [
				{
					label: 'Windows',
					value: 'winget install -e --id yt-dlp.yt-dlp\nwinget install -e --id Gyan.FFmpeg'
				},
				{
					label: 'macOS',
					value: 'brew install yt-dlp ffmpeg'
				},
				{
					label: 'Python',
					value: 'python -m pip install -U "yt-dlp[default]"'
				}
			]
		},
		{
			title: 'Check',
			commands: [
				{
					label: 'yt-dlp',
					value: 'yt-dlp --version'
				},
				{
					label: 'ffmpeg',
					value: 'ffmpeg -version'
				}
			]
		}
	] satisfies Section[];

	const commandSections = $derived([
		{
			title: 'Video',
			commands: [
				{
					label: 'Best',
					value: `yt-dlp -f "bv*+ba/b" -o "%(title)s.%(ext)s" ${quotedUrl}`
				},
				{
					label: 'MP4',
					value: `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "%(title)s.%(ext)s" ${quotedUrl}`
				},
				{
					label: '1080p',
					value: `yt-dlp -f "bv*[height<=1080]+ba/b[height<=1080]" --merge-output-format mp4 -o "%(title)s.%(ext)s" ${quotedUrl}`
				}
			]
		},
		{
			title: 'Audio',
			commands: [
				{
					label: 'MP3',
					value: `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "%(title)s.%(ext)s" ${quotedUrl}`
				},
				{
					label: 'M4A',
					value: `yt-dlp -x --audio-format m4a -o "%(title)s.%(ext)s" ${quotedUrl}`
				},
				{
					label: 'OPUS',
					value: `yt-dlp -x --audio-format opus -o "%(title)s.%(ext)s" ${quotedUrl}`
				}
			]
		},
		{
			title: 'Playlist',
			commands: [
				{
					label: 'Video',
					value: `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "%(playlist_index)s - %(title)s.%(ext)s" ${quotedUrl}`
				},
				{
					label: 'Audio',
					value: `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "%(playlist_index)s - %(title)s.%(ext)s" ${quotedUrl}`
				}
			]
		},
		{
			title: 'Extra',
			commands: [
				{
					label: 'Formats',
					value: `yt-dlp -F ${quotedUrl}`
				},
				{
					label: 'Subs',
					value: `yt-dlp --write-subs --write-auto-subs --sub-langs "en.*,es.*,ja.*" --skip-download ${quotedUrl}`
				},
				{
					label: 'Cookies',
					value: `yt-dlp --cookies-from-browser chrome ${quotedUrl}`
				}
			]
		}
	] satisfies Section[]);
</script>

<div class="flex flex-col gap-3">
	<div class="text-sm opacity-70">
		Install <code>yt-dlp</code> + <code>ffmpeg</code>, then run the commands locally.
	</div>

	<TextInput bind:value={url} label="URL" placeholder="https://www.youtube.com/watch?v=VIDEO_ID" />

	{#each installSections as section}
		<section class="flex flex-col gap-1">
			<h2 class="text-sm font-medium opacity-80">{section.title}</h2>

			<div class="flex flex-col gap-1">
				{#each section.commands as command}
					<LabeledRow group="youtube-download" label={command.label} value={command.value} />
				{/each}
			</div>
		</section>
	{/each}

	{#if hasUrl}
		{#each commandSections as section}
			<section class="flex flex-col gap-1">
				<h2 class="text-sm font-medium opacity-80">{section.title}</h2>

				<div class="flex flex-col gap-1">
					{#each section.commands as command}
						<LabeledRow group="youtube-download" label={command.label} value={command.value} />
					{/each}
				</div>
			</section>
		{/each}
	{/if}
</div>
