<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Button from '$lib/components/ui/button';
	import type { Task as ScheduledTask } from '$lib/types';
	import Task from './Task.svelte';
	import { onMount } from 'svelte';
	import { formatDuration } from '$lib/date';
	import { invalidateAll } from '$app/navigation';
	import NumericInput from '$lib/components/NumericInput.svelte';

	export let data;
	let schedule: Array<ScheduledTask> = data.tasks;
	$: schedule = data.tasks;
	let current: ScheduledTask | undefined;
	let next: Array<ScheduledTask> = [];
	let breakHours: number = 0;
	let breakMinutes: number = 0;

	setCurrent();
	setNext();

	onMount(() => {
		setInterval(setCurrent, 1000);
		setInterval(setNext, 1000);
	});

	function setCurrent() {
		current = schedule.find((task, a, b) => {
			if (task.scheduled === null) {
				return false;
			}
			let now = Date.now();
			let start = task.scheduled.getTime();
			let end = task.scheduled.getTime() + task.duration * 1000;
			return start <= now && now <= end;
		});
	}

	function setNext() {
		next = schedule
			.filter((task) => task.scheduled && (current ? task.id != current.id : true))
			.sort((a, b) => a.scheduled?.getTime() - b.scheduled?.getTime());
		console.log(next);
	}

	function timeUntil(task: ScheduledTask): string {
		if (task.scheduled === null) {
			return 'Unscheduled';
		}
		if (task.scheduled.getTime() < Date.now()) {
			return 'Overdue';
		}
		let between = task.scheduled.getTime() - Date.now();
		return `Next in ${formatDuration(between / 1000)}`;
	}

	async function complete() {
		if (current == undefined) return;
		await fetch('/api/complete', { method: 'POST', body: JSON.stringify({ id: current.id }) });
        await sleep(500);
		await invalidateAll();
	}

    function sleep(duration: number): Promise<void> {
        return new Promise(res => setTimeout(res, duration));
    }

	async function takeBreak() {
		let duration = breakHours * 3600 + breakMinutes * 60;
		let deadline = new Date(Date.now() + duration * 1000);
		let title = 'Break';
		await fetch('/api/tasks', {
			method: 'POST',
			body: JSON.stringify({ duration, deadline, title })
		});
        await sleep(500);
		await invalidateAll();
	}

    async function snooze() {
        if (!current) { return; }
        current.startAfter = new Date(current.startAfter.getTime() + (3600 * 1000));
        const body = {
            startAfter: current.startAfter.getTime(),
			deadline: current.deadline.getTime(),
			duration: current.duration,
			title: current.title,
			id: current.id,
			repeat: current.repeat
		};
		await fetch('/api/tasks', { method: 'PATCH', body: JSON.stringify(body) });
        await sleep(500);
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
			<Button.Root class="p-8 text-xl lg:p-16 lg:text-3xl" on:click={complete}>Complete</Button.Root
			>
			<Button.Root class="p-8 text-xl lg:p-16 lg:text-3xl" on:click={snooze}>Snooze</Button.Root>
		</div>
		{#if next[0]}
			<Task description={timeUntil(next[0])} task={next[0]} />
		{:else}
			<Card.Root class="p-16">
				<Card.Header>
					<Card.Title class="text-center text-5xl">Nothing upcoming</Card.Title>
				</Card.Header>
			</Card.Root>
		{/if}
		<Card.Root class="grid grid-cols-3 gap-4 p-8">
			<NumericInput bind:value={breakHours} />
			<NumericInput bind:value={breakMinutes} />
			<Button.Root class="text-xl" on:click={takeBreak}>Take a break</Button.Root>
		</Card.Root>
	</div>
	<div class="hidden grid-rows-4 gap-4 lg:grid">
		{#each next.slice(1, 5) as task}
			<Task description={timeUntil(task)} {task} />
		{/each}
	</div>
</div>
