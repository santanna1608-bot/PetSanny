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
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error('Não foi possível preparar a foto.');
        const side = Math.min(bitmap.width, bitmap.height);
        const attempts = [
            { size: 80, quality: 0.7 },
            { size: 64, quality: 0.6 },
            { size: 64, quality: 0.45 },
            { size: 56, quality: 0.4 },
            { size: 48, quality: 0.35 },
            { size: 40, quality: 0.3 },
        ];
        for (const attempt of attempts) {
            canvas.width = canvas.height = attempt.size;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, attempt.size, attempt.size);
            ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, attempt.size, attempt.size);
            const result = canvas.toDataURL('image/jpeg', attempt.quality);
            if (result.length <= 3500) {
                return result;
            }
        }
        canvas.width = canvas.height = 36;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 36, 36);
        ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 36, 36);
        return canvas.toDataURL('image/jpeg', 0.25);
    }
    finally {
        bitmap.close();
    }
}
export async function prepareClinicLogo(file: File): Promise<string> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
        throw new Error('Escolha uma foto ou logo JPG, PNG ou WebP.');
    if (file.size > 5 * 1024 * 1024)
        throw new Error('O arquivo deve ter até 5 MB.');
    const bitmap = await createImageBitmap(file);
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx)
            throw new Error('Não foi possível preparar o logo.');
        const maxDim = 80;
        let w = bitmap.width;
        let h = bitmap.height;
        if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.max(1, Math.round(w * ratio));
            h = Math.max(1, Math.round(h * ratio));
        }
        const attempts = [
            { w, h, quality: 0.75 },
            { w: Math.round(w * 0.8), h: Math.round(h * 0.8), quality: 0.6 },
            { w: Math.round(w * 0.6), h: Math.round(h * 0.6), quality: 0.45 },
            { w: 48, h: 48, quality: 0.35 },
        ];
        for (const attempt of attempts) {
            canvas.width = Math.max(1, attempt.w);
            canvas.height = Math.max(1, attempt.h);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            const result = canvas.toDataURL('image/jpeg', attempt.quality);
            if (result.length <= 3500) {
                return result;
            }
        }
        canvas.width = 36;
        canvas.height = 36;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 36, 36);
        ctx.drawImage(bitmap, 0, 0, 36, 36);
        return canvas.toDataURL('image/jpeg', 0.25);
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
