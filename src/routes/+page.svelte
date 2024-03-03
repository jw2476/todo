<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button';
	import type { ScheduledTask } from '$lib/schedule.js';
	import Task from './Task.svelte';
	import { onMount } from 'svelte';
	import { formatDuration } from '$lib/date';
    import { invalidateAll } from "$app/navigation";

	export let data;
	let schedule: Array<ScheduledTask> = data.schedule;
    $: schedule = data.schedule;
	let current: ScheduledTask | undefined;
	let next: Array<ScheduledTask> = [];

	onMount(() => {
		setInterval(setCurrent, 1000);
		setInterval(setNext, 1000);
	});

	function setCurrent() {
		current = schedule.find((task, a, b) => {
			let now = Date.now();
			let start = task.start.getTime();
			let end = task.start.getTime() + task.task.duration * 1000;
			return start <= now && now <= end;
		});
		console.log(current);
	}

	function setNext() {
		next = schedule
			.sort((a, b) => a.start.getTime() - b.start.getTime())
			.filter((task) => task.start.getTime() > Date.now());
		console.log(next);
	}

	function timeUntil(task: ScheduledTask): string {
        let between = task.start.getTime() - Date.now();
        return formatDuration(between / 1000);
    }

    async function complete() {
        if (current == undefined) return;
        await fetch("/api/tasks", { method: "DELETE", body: JSON.stringify({ id: current.task.id }) });
        await invalidateAll();
    }
</script>

<div class="p-8 md:p-16 lg:mx-[15vw] lg:grid lg:grid-cols-3 lg:gap-4">
	<div class="flex flex-col items-stretch gap-4 lg:col-span-2">
		{#if current}
			<Task description="Current" task={current} />
		{:else}
			<Card.Root class="p-16">
				<Card.Header>
					<Card.Title class="text-center text-5xl">Nothing to do!</Card.Title>
				</Card.Header>
			</Card.Root>
		{/if}
		<div class="grid gap-4 max-lg:grid-rows-2 lg:grid-cols-2">
			<Button.Root class="p-8 text-xl lg:p-16 lg:text-3xl" on:click={complete}>Complete</Button.Root>
			<Button.Root class="p-8 text-xl lg:p-16 lg:text-3xl">Snooze</Button.Root>
		</div>
		{#if next[0]}
			<Task description={`Next in ${timeUntil(next[0])}`} task={next[0]} />
		{:else}
			<Card.Root class="p-16">
				<Card.Header>
					<Card.Title class="text-center text-5xl">Nothing upcoming</Card.Title>
				</Card.Header>
			</Card.Root>
		{/if}
		<Button.Root class="p-16 text-3xl">Take a break</Button.Root>
	</div>
	<div class="hidden grid-rows-4 gap-4 lg:grid">
        {#each next.slice(1, 4) as task}
            
		<Task description={`Next in ${timeUntil(task)}`} task={task} />
        {/each}
	</div>
</div>
