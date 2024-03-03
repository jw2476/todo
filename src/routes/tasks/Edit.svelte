<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { Task } from '$lib/types';
	import { parseDate, type DateValue, fromDate } from '@internationalized/date';
	import DatePicker from './DatePicker.svelte';
	import { z } from 'zod';
	import NumericInput from './NumericInput.svelte';

	export let task: Task;
	export let dialogTitle: string;
	export let callback: (task: Task) => void;
	let title: string;
	let hours: number, minutes: number;
	let deadlineDate: DateValue, deadlineHours: number, deadlineMinutes: number;
	let open: boolean = false;
	let issues: string[] = [];

	function start() {
		title = task.title;
		hours = task.duration / 3600;
		minutes = (task.duration % 3600) / 60;
		deadlineDate = fromDate(task.deadline, 'Europe/London');
		deadlineHours = task.deadline.getHours();
		deadlineMinutes = task.deadline.getMinutes();
		console.log(deadlineDate);
	}

	async function submit() {
		let schema = z.object({
			hours: z.number().min(0),
			minutes: z.number().min(0).max(60),
			deadlineHours: z.number().min(0),
			deadlineMinutes: z.number().min(0).max(60),
			deadlineDate: z.date(),
			title: z.string().min(1)
		});

		const result = schema.safeParse({ hours, minutes, deadlineHours, deadlineMinutes, deadlineDate: deadlineDate.toDate('Europe/London'), title });
		if (!result.success) {
            console.log(result.error.issues)
            issues = result.error.issues.map(issue => `${issue.path[0]}: ${issue.message}`);
            return
		}

		let duration = hours * 3600 + minutes * 60;
		let deadline = deadlineDate.toDate('Europe/London');
		deadline.setHours(deadlineHours);
		deadline.setMinutes(deadlineMinutes);
		task = { title, duration, deadline, id: task.id };
		callback(task);
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })} on:click={start}>
		<slot />
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-center">{dialogTitle}</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid grid-cols-5 items-center gap-4">
				<Label for="title" class="text-right">Title</Label>
				<Input id="title" bind:value={title} class="col-span-4" />
			</div>
			<div class="grid grid-cols-5 items-center gap-4">
				<Label for="duration" class="text-right">Duration</Label>
				<NumericInput bind:value={hours} class="col-span-2" />
				<NumericInput bind:value={minutes} class="col-span-2" />
			</div>
			<div class="grid grid-cols-5 items-center gap-4">
				<Label for="duration" class="text-right">Deadline</Label>
				<DatePicker bind:value={deadlineDate} class="col-span-4" />
			</div>
			<div class="grid grid-cols-5 items-center gap-4">
				<p />
				<NumericInput bind:value={deadlineHours} class="col-span-2" />
				<NumericInput bind:value={deadlineMinutes} class="col-span-2" />
			</div>
		</div>
		<Dialog.Footer>
			<Button type="submit" on:click={submit}>Save</Button>
		</Dialog.Footer>
        {#each issues as issue}
				<p class="text-red-500 text-right">{issue}</p>
			{/each}
	</Dialog.Content>
</Dialog.Root>
