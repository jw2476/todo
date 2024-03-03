<script lang="ts">
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Card } from '$lib/components/ui/card';
	import { schema, type Schema } from './schema';
	import { Toaster } from '$lib/components/ui/sonner';
	import { toast } from 'svelte-sonner';

	export let data: SuperValidated<Infer<Schema>>;

	const form = superForm(data, {
		validators: zodClient(schema)
	});

	const { form: formData, enhance, message } = form;

	message.subscribe((token) => {
		toast('Logged in');
	});
</script>

<Card class="mx-[40vw] my-16 p-16">
	<form method="POST" use:enhance>
		<Form.Field {form} name="username">
			<Form.Control let:attrs>
				<Form.Label>Username</Form.Label>
				<Input {...attrs} bind:value={$formData.username} />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="password">
			<Form.Control let:attrs>
				<Form.Label>Password</Form.Label>
				<Input {...attrs} bind:value={$formData.password} type="password" />
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<br />
		<Form.Button>Log In</Form.Button>
	</form>
</Card>
<Toaster />
