<script lang="ts">
    import * as Card from "$lib/components/ui/card";
	import type { ScheduledTask } from "$lib/schedule";
    import Clock from "svelte-radix/Clock.svelte";
    import Calendar from "svelte-radix/Calendar.svelte";
	import { formatDuration } from "$lib/date";
    
    export let task: ScheduledTask;
    export let description: string;
    
    function duration(): string {
        return formatDuration(task.task.duration);
    }

    function deadline(): string {
        const value = task.task.deadline;
        return `${value.getDate()}/${value.getMonth()}/${value.getFullYear()}`
    }
</script>

<Card.Root>
    <Card.Header>
        <Card.Title class="text-center text-5xl">{task.task.title}</Card.Title>
        <Card.Description class="text-center">{description}</Card.Description>
    </Card.Header>
    <Card.Footer class="lg:px-16">
        <div class="flex grow justify-between">
            <div class="flex grow justify-start gap-2">
                <Clock />
                {duration()}
            </div>
            <div class="flex grow justify-end gap-2">
                <Calendar />
                {deadline()}
            </div>
        </div>
    </Card.Footer>
</Card.Root>
