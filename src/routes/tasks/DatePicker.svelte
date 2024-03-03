<script lang="ts">
    import CalendarIcon from "svelte-radix/Calendar.svelte";
    import {
      type DateValue,
      DateFormatter,
      getLocalTimeZone
    } from "@internationalized/date";
    import { cn } from "$lib/utils";
    import { Button } from "$lib/components/ui/button";
    import { Calendar } from "$lib/components/ui/calendar";
    import * as Popover from "$lib/components/ui/popover";
	import type { ClassValue } from "tailwind-variants";
   
    const df = new DateFormatter("en-GB", {
      dateStyle: "long"
    });

    let className: ClassValue = undefined;
	export { className as class };

   
    export let value: DateValue | undefined = undefined;
  </script>
   
  <Popover.Root>
    <Popover.Trigger asChild let:builder>
      <Button
        variant="outline"
        class={cn(cn(
          "justify-start text-left font-normal",
          !value && "text-muted-foreground"
        ), className)}
        builders={[builder]}
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {value ? df.format(value.toDate(getLocalTimeZone())) : "Pick a date"}
      </Button>
    </Popover.Trigger>
    <Popover.Content class="w-auto p-0" align="start">
      <Calendar bind:value />
    </Popover.Content>
  </Popover.Root>