<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Button from './ui/button/button.svelte';
	import { goto, invalidateAll } from '$app/navigation';

    export let authed: boolean = true;

    function sleep(duration: number): Promise<void> {
        return new Promise(res => setTimeout(res, duration));
    }

    onMount(async () => {
        let res = await fetch("/api/me").catch(() => {});
        if (res == null) { return; }
        if (res.ok) { authed = true; }
    })

    async function logout() {
        await fetch("/api/logout");
        await goto("/login");
    }
</script>

<div class="flex justify-between border-b p-4">
	<div class="flex items-start gap-4">
		<Button href="/">Overview</Button>
		<Button href="/tasks">Tasks</Button>
	</div>
	{#if authed}
		<Button on:click={logout}>Log Out</Button>
	{:else}
		<div class="flex items-end gap-4">
			<Button href="/login">Log In</Button>
			<Button href="/signup">Sign Up</Button>
		</div>
	{/if}
</div>
