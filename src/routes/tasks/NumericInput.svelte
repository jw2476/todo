<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { onMount } from 'svelte';

	let className: string | null | undefined = undefined;
	export let value: number;
    let text: string
	export { className as class };

	function check() {
		let c = text[text.length - 1];
		if (c < '0' || c > '9') {
			text = text.substring(0, text.length - 2);
		} else {
            value = parseInt(text);
        }
	}

    onMount(() => {
        text = value.toString().padStart(2, "0");
    });
</script>

<Input class={className} bind:value={text} on:input={check} />
