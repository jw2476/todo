<script lang="ts">
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Card } from '$lib/components/ui/card';
	import { schema, type Schema } from './schema';
	import { toast } from 'svelte-sonner';
	import { Toaster } from '$lib/components/ui/sonner';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';

	export let data: SuperValidated<Infer<Schema>>;

	const form = superForm(data, {
		validators: zodClient(schema)
	});

	const { form: formData, enhance } = form;
</script>

<Nav authed={false} />
<Card class="mx-[40vw] my-16 p-16">
	<form method="POST" use:enhance>
		<Form.Field {form} name="username">
			<Form.Control let:attrs>
				<Form.Label>Username</Form.Label>
				<Input autocomplete="username" {...attrs} bind:value={$formData.username} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="password">
			<Form.Control let:attrs>
				<Form.Label>Password</Form.Label>
				<Input autocomplete="current-password" {...attrs} bind:value={$formData.password} type="password" />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<br />
		<Form.Button>Sign Up</Form.Button>
	</form>
</Card>
<Toaster />
