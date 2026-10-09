import { requireSupabase } from './supabaseClient';
export async function changeAccountPassword(email: string, currentPassword: string, password: string, confirmation: string) {
    if (!currentPassword)
        throw new Error('Informe sua senha atual.');
    if (password.length < 8)
        throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
    if (password !== confirmation)
        throw new Error('As novas senhas não coincidem.');
    if (password === currentPassword)
        throw new Error('Escolha uma senha diferente da atual.');
    const client = requireSupabase();
    const { error: signInError } = await client.auth.signInWithPassword({ email, password: currentPassword });
    if (signInError)
        throw new Error('Não foi possível confirmar sua senha atual.');
    const { error } = await client.auth.updateUser({ password });
    if (error)
        throw new Error('Não foi possível alterar a senha. Tente novamente.');
}
export async function prepareProfilePhoto(file: File): Promise<string> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
        throw new Error('Escolha uma foto JPG, PNG ou WebP.');
    if (file.size > 5 * 1024 * 1024)
        throw new Error('A foto deve ter até 5 MB.');
    const bitmap = await createImageBitmap(file);
    try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error('Não foi possível preparar a foto.');
        const side = Math.min(bitmap.width, bitmap.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 64, 64);
        ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 64, 64);
        const result = canvas.toDataURL('image/jpeg', 0.45);
        if (result.length > 3500)
            throw new Error('Escolha uma foto mais simples ou menor.');
        return result;
    }
    finally {
        bitmap.close();
    }
}
export async function saveClinicSettings(id: string, name: string, location: string) {
    if (name.trim().length < 2 || name.trim().length > 255)
        throw new Error('O nome da clínica deve ter de 2 a 255 caracteres.');
    if (location.trim().length > 500)
        throw new Error('O endereço deve ter até 500 caracteres.');
    const { data, error } = await requireSupabase().from('tenants').update({ name: name.trim(), location: location.trim() }).eq('id', id).select('id,name,location').single();
    if (error || !data)
        throw new Error('Não foi possível salvar os dados da clínica. Confira sua permissão.');
    return data as {
        id: string;
        name: string;
        location: string;
    };
}
