<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import Trash from 'svelte-radix/Trash.svelte';
	import { type Task } from '$lib/types';
	import Edit from './Edit.svelte';
	import Pencil from 'svelte-radix/Pencil2.svelte';
	import Plus from 'svelte-radix/Plus.svelte';
	import { writable } from 'svelte/store';

	export let data;
	let tasks = writable(data.tasks);

	let staging: Task = { deadline: new Date(Date.now()), duration: 0, title: '', id: 0, scheduled: null, repeat: 0 };

	function duration(duration: number): string {
		function pad(data: string): string {
			if (data.length == 1) {
				return data + '0';
			} else {
				return data;
			}
		}

		let hours = Math.floor(duration / 3600);
		let minutes = Math.floor((duration % 3600) / 60);

		return `${hours}:${pad(minutes.toString())}`;
	}

	function deadline(deadline: Date): string {
		console.log(deadline);
		if (deadline.toDateString() == new Date(Date.now()).toDateString()) {
			return `${deadline.getHours().toString().padStart(2, '0')}:${deadline.getMinutes().toString().padStart(2, '0')}`;
		} else {
			return `${deadline.getDate()}/${deadline.getMonth()}/${deadline.getFullYear()}`;
		}
	}

	async function deleteTask(task: Task) {
		await fetch('/api/tasks', { method: 'DELETE', body: JSON.stringify({ id: task.id }) });
		tasks.update((tasks) => {
			tasks.splice(data.tasks.indexOf(task), 1);
			return tasks;
		});
	}

	async function patchTask(task: Task) {
		const body = {
			deadline: task.deadline.getTime(),
			duration: task.duration,
			title: task.title,
			id: task.id,
            repeat: task.repeat
		};
		await fetch('/api/tasks', { method: 'PATCH', body: JSON.stringify(body) });
	}

	async function createTask(task: Task) {
		const body = { deadline: task.deadline.getTime(), duration: task.duration, title: task.title, repeat: task.repeat };
		let res = await fetch('/api/tasks', { method: 'POST', body: JSON.stringify(body) });
		task.id = (await res.json()).id;
		tasks.update((tasks) => {
			tasks.push(task);
			return tasks;
		});
	}
</script>

<Card.Root class="m-16 px-16 pb-16 pt-4">
	<Card.Header>
		<Card.Title class="cols-span-9 text-center text-5xl">Tasks</Card.Title>
		<br />
		<Edit callback={createTask} bind:task={staging} dialogTitle="Create task">
			<Plus class="h-4 w-4" />
		</Edit>
	</Card.Header>
	<Card.Root>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="text-center">Title</Table.Head>
					<Table.Head class="text-center">Duration</Table.Head>
					<Table.Head class="text-center">Deadline</Table.Head>
                    <Table.Head class="text-center">Repeat</Table.Head>
                    <Table.Head class="text-center">Scheduled</Table.Head>
					<Table.Head class="px-8 text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each $tasks as task}
					<Table.Row>
						<Table.Cell class="text-center">{task.title}</Table.Cell>
						<Table.Cell class="text-center">{duration(task.duration)}</Table.Cell>
						<Table.Cell class="text-center">{deadline(task.deadline)}</Table.Cell>
						<Table.Cell class="text-center">{task.repeat ? `${task.repeat?.toString()} days` : "-"}</Table.Cell>
                        <Table.Cell class="text-center">{task.scheduled ? deadline(task.scheduled) : "-"}</Table.Cell>

						<Table.Cell class="text-right">
							<Edit callback={patchTask} dialogTitle="Edit task" bind:task>
								<Pencil class="h-4 w-4" />
							</Edit>
							<Button variant="destructive" size="icon" on:click={() => deleteTask(task)}>
								<Trash class="h-4 w-4" />
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Root>
</Card.Root>
