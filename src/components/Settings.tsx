import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../contexts/AppointmentsContext';
import { requireSupabase } from '../lib/supabaseClient';
import { changeAccountPassword, prepareProfilePhoto, prepareClinicLogo, saveClinicSettings } from '../lib/accountSettings';
import { SupportContact } from './SupportContact';
import { User, Building2, Trash2 } from 'lucide-react';
export const AVATARS = [
    { id: 'avatar-dog', emoji: '🐶', name: 'Cão', bg: 'from-amber-400 to-orange-500' },
    { id: 'avatar-cat', emoji: '🐱', name: 'Gato', bg: 'from-indigo-400 to-violet-500' },
    { id: 'avatar-hamster', emoji: '🐹', name: 'Hamster', bg: 'from-rose-400 to-pink-500' },
    { id: 'avatar-parrot', emoji: '🦜', name: 'Ave', bg: 'from-emerald-400 to-teal-500' },
    { id: 'avatar-lion', emoji: '🦁', name: 'Leão', bg: 'from-yellow-400 to-amber-500' },
    { id: 'avatar-fox', emoji: '🦊', name: 'Raposa', bg: 'from-orange-400 to-red-500' },
];
export const renderAvatarHelper = (value?: string, sizeClass = 'w-10 h-10 text-base') => {
    if (value && (value.startsWith('data:image/') || value.startsWith('https://') || value.startsWith('/')))
        return <img src={value} alt="Foto de perfil" className={sizeClass + ' rounded-full object-cover shrink-0'}/>;
    const avatar = AVATARS.find(a => a.id === value) || AVATARS[0];
    return <div className={sizeClass + ' rounded-full bg-gradient-to-tr ' + avatar.bg + ' flex items-center justify-center shrink-0'}>{avatar.emoji}</div>;
};
export const Settings: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const { language, setLanguage } = useLanguage();
    const { currentTenant, setCurrentTenant } = useAppointments();
    const [name, setName] = useState(user?.user_metadata.name || '');
    const [phone, setPhone] = useState(user?.user_metadata.phone || '');
    const [avatar, setAvatar] = useState(user?.user_metadata.avatar_url || 'avatar-dog');
    const [clinicLogo, setClinicLogo] = useState(
        user?.user_metadata.clinic_logo_url ||
        (currentTenant?.id ? localStorage.getItem('petsanny_clinic_logo_' + currentTenant.id) || '' : '')
    );
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [clinicName, setClinicName] = useState(currentTenant.name);
    const [location, setLocation] = useState(currentTenant.location || '');
    const [busy, setBusy] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const canEditClinic = !user?.is_super_admin && user?.memberships.some(m => m.tenant_id === currentTenant.id && ['owner', 'admin'].includes(m.role));
    const run = async (key: string, action: () => Promise<void>) => {
        setBusy(key);
        setMessage('');
        setError('');
        try {
            await action();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Não foi possível salvar. Tente novamente.');
        }
        finally {
            setBusy('');
        }
    };
    const input = 'w-full border border-stone-200 dark:border-stone-700 rounded-xl p-3 bg-stone-50 dark:bg-stone-950 text-sm';
    const card = 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4';
    const button = 'bg-[#526f39] text-white rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-50 cursor-pointer';

    const isCustomImage = avatar && (avatar.startsWith('data:image/') || avatar.startsWith('http'));

    return (
        <div className="max-w-4xl space-y-5 text-stone-900 dark:text-stone-100">
            <div>
                <h2 className="text-xl font-bold">Configurações da conta</h2>
                <p className="text-sm text-stone-500 mt-1">
                    Seu perfil e acesso{canEditClinic ? ' e os dados da clínica' : ''}.
                </p>
            </div>

            {error && <p role="alert" className="rounded-xl bg-red-50 text-red-800 p-4">{error}</p>}
            {message && <p role="status" className="rounded-xl bg-green-50 text-green-800 p-4">{message}</p>}

            <form
                className={card}
                onSubmit={e => {
                    e.preventDefault();
                    void run('profile', async () => {
                        if (name.trim().length < 2 || name.trim().length > 100)
                            throw new Error('Informe um nome de 2 a 100 caracteres.');
                        if (phone && phone.replace(/\D/g, '').length < 10)
                            throw new Error('Informe um telefone válido com DDD.');
                        await updateProfile({
                            name: name.trim(),
                            phone: phone.trim(),
                            avatar_url: avatar,
                            clinic_logo_url: clinicLogo,
                        });
                        if (currentTenant?.id && clinicLogo) {
                            try {
                                localStorage.setItem('petsanny_clinic_logo_' + currentTenant.id, clinicLogo);
                            } catch {}
                        }
                        setMessage('Perfil atualizado com sucesso.');
                    });
                }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-base">Perfil pessoal</h3>
                        <p className="text-xs text-stone-500 mt-0.5">
                            Suba uma foto de perfil ou o logo da clínica para exibição.
                        </p>
                    </div>
                    {isCustomImage && (
                        <button
                            type="button"
                            disabled={!!busy}
                            onClick={() => {
                                setAvatar('avatar-dog');
                                setMessage('Foto removida. Clique em "Salvar perfil" para confirmar.');
                            }}
                            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-medium cursor-pointer"
                        >
                            <Trash2 size={14} />
                            <span>Remover foto</span>
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-stone-100/70 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800">
                    <div className="relative shrink-0">
                        {renderAvatarHelper(avatar, 'w-24 h-24 text-4xl shadow-md')}
                        {isCustomImage && (
                            <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-stone-900 shadow">
                                Foto ativa
                            </span>
                        )}
                    </div>

                    <div className="flex-1 w-full space-y-3">
                        <div className="flex flex-wrap gap-2.5">
                            <label className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-98">
                                <User size={15} className="text-[#526f39]" />
                                <span>Subir foto do usuário</span>
                                <input
                                    aria-label="Foto de perfil"
                                    disabled={!!busy}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            void run('photo', async () => {
                                                const photo = await prepareProfilePhoto(file);
                                                setAvatar(photo);
                                                setMessage('Foto do usuário preparada! Clique em "Salvar perfil" abaixo para confirmar.');
                                            });
                                        }
                                        e.target.value = '';
                                    }}
                                />
                            </label>

                            <label className="flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-98">
                                <Building2 size={15} className="text-amber-500" />
                                <span>Subir logo da clínica</span>
                                <input
                                    aria-label="Logo da clínica"
                                    disabled={!!busy}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            void run('logo', async () => {
                                                const logo = await prepareClinicLogo(file);
                                                setAvatar(logo);
                                                setClinicLogo(logo);
                                                setMessage('Logo da clínica preparado! Clique em "Salvar perfil" abaixo para confirmar.');
                                            });
                                        }
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                        </div>

                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            Formatos aceitos: JPG, PNG ou WebP até 5 MB. A imagem é otimizada automaticamente.
                        </p>

                        <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                            <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-2">
                                Ou escolha um avatar ilustrado:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {AVATARS.map(a => (
                                    <button
                                        aria-label={'Usar avatar ' + a.name}
                                        aria-pressed={avatar === a.id}
                                        type="button"
                                        disabled={!!busy}
                                        onClick={() => {
                                            setAvatar(a.id);
                                            setMessage('Avatar ' + a.name + ' selecionado. Clique em "Salvar perfil".');
                                        }}
                                        key={a.id}
                                        className={`border rounded-xl p-2.5 text-lg transition-all cursor-pointer ${
                                            avatar === a.id
                                                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30'
                                                : 'border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                                        }`}
                                    >
                                        {a.emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <label className="text-sm">
                        Nome
                        <input
                            required
                            maxLength={100}
                            autoComplete="name"
                            className={input}
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </label>
                    <label className="text-sm">
                        Telefone com DDD
                        <input
                            type="tel"
                            maxLength={25}
                            autoComplete="tel"
                            placeholder="(11) 99999-9999"
                            className={input}
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />
                    </label>
                </div>

                <button className={button} disabled={!!busy}>
                    {busy === 'profile' ? 'Salvando…' : 'Salvar perfil'}
                </button>
            </form>

            {canEditClinic && (
                <form
                    className={card}
                    onSubmit={e => {
                        e.preventDefault();
                        void run('clinic', async () => {
                            const saved = await saveClinicSettings(currentTenant.id, clinicName, location);
                            setCurrentTenant({
                                ...currentTenant,
                                name: saved.name,
                                location: saved.location,
                            });
                            if (clinicLogo) {
                                try {
                                    localStorage.setItem('petsanny_clinic_logo_' + currentTenant.id, clinicLogo);
                                } catch {}
                                await updateProfile({ clinic_logo_url: clinicLogo });
                            }
                            setMessage('Dados da clínica atualizados com sucesso.');
                        });
                    }}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold">Dados da clínica</h3>
                        {clinicLogo && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                Logo configurado
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-stone-100/70 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800">
                        <div className="w-16 h-16 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                            {clinicLogo ? (
                                <img src={clinicLogo} alt="Logo da clínica" className="w-full h-full object-contain p-1" />
                            ) : (
                                <Building2 className="w-8 h-8 text-stone-400" />
                            )}
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-98">
                                    <Building2 size={14} className="text-amber-500" />
                                    <span>{clinicLogo ? 'Trocar logo da clínica' : 'Enviar logo da clínica'}</span>
                                    <input
                                        aria-label="Logo da clínica nos dados da clínica"
                                        disabled={!!busy}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                void run('clinic_logo', async () => {
                                                    const logo = await prepareClinicLogo(file);
                                                    setClinicLogo(logo);
                                                    setMessage('Logo da clínica preparado! Clique em "Salvar dados da clínica" para confirmar.');
                                                });
                                            }
                                            e.target.value = '';
                                        }}
                                    />
                                </label>

                                {clinicLogo && (
                                    <button
                                        type="button"
                                        disabled={!!busy}
                                        onClick={() => {
                                            setClinicLogo('');
                                            if (currentTenant?.id) {
                                                try {
                                                    localStorage.removeItem('petsanny_clinic_logo_' + currentTenant.id);
                                                } catch {}
                                            }
                                            setMessage('Logo da clínica removido. Clique em "Salvar dados da clínica" para confirmar.');
                                        }}
                                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 cursor-pointer"
                                    >
                                        <Trash2 size={13} />
                                        <span>Remover logo</span>
                                    </button>
                                )}
                            </div>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                Este logo aparecerá na barra lateral e na identidade da sua clínica. Formatos: JPG, PNG ou WebP até 5 MB.
                            </p>
                        </div>
                    </div>

                    <label className="block text-sm">
                        Nome da clínica
                        <input
                            required
                            maxLength={255}
                            className={input}
                            value={clinicName}
                            onChange={e => setClinicName(e.target.value)}
                        />
                    </label>
                    <label className="block text-sm">
                        Endereço
                        <input
                            maxLength={500}
                            className={input}
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                        />
                    </label>
                    <button disabled={!!busy} className={button}>
                        {busy === 'clinic' ? 'Salvando…' : 'Salvar dados da clínica'}
                    </button>
                </form>
            )}

            <form
                className={card}
                onSubmit={e => {
                    e.preventDefault();
                    void run('email', async () => {
                        if (email.trim() === user?.email)
                            throw new Error('Informe um e-mail diferente do atual.');
                        const { error } = await requireSupabase().auth.updateUser(
                            { email: email.trim() },
                            { emailRedirectTo: window.location.origin + '/#auth' }
                        );
                        if (error)
                            throw new Error('Não foi possível solicitar a alteração do e-mail.');
                        setMessage('Alteração solicitada. Confira as mensagens enviadas pelo Supabase e confirme os links necessários. Seu acesso usa o e-mail atual até a confirmação.');
                    });
                }}
            >
                <h3 className="font-bold">E-mail de acesso</h3>
                <p className="text-sm text-stone-500">
                    Atual: {user?.email}. A alteração pode exigir confirmação no endereço atual e no novo.
                </p>
                <label className="block text-sm">
                    Novo e-mail
                    <input
                        type="email"
                        required
                        autoComplete="email"
                        className={input}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </label>
                <button disabled={!!busy} className={button}>
                    Solicitar alteração do e-mail
                </button>
            </form>

            <form
                className={card}
                onSubmit={e => {
                    e.preventDefault();
                    void run('password', async () => {
                        await changeAccountPassword(user?.email || '', currentPassword, password, confirmation);
                        setCurrentPassword('');
                        setPassword('');
                        setConfirmation('');
                        setMessage('Senha alterada com sucesso.');
                    });
                }}
            >
                <h3 className="font-bold">Trocar senha</h3>
                <p className="text-sm text-stone-500">
                    Use pelo menos 8 caracteres. Escolha uma senha exclusiva para sua conta.
                </p>
                <label className="block text-sm">
                    Senha atual
                    <input
                        type="password"
                        required
                        autoComplete="current-password"
                        className={input}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                    />
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                    <label className="text-sm">
                        Nova senha
                        <input
                            type="password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            className={input}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </label>
                    <label className="text-sm">
                        Confirmar nova senha
                        <input
                            type="password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            className={input}
                            value={confirmation}
                            onChange={e => setConfirmation(e.target.value)}
                        />
                    </label>
                </div>
                <button disabled={!!busy} className={button}>
                    {busy === 'password' ? 'Alterando…' : 'Alterar senha'}
                </button>
            </form>

            <section className={card}>
                <h3 className="font-bold">Idioma</h3>
                <label className="block text-sm">
                    Idioma do painel
                    <select
                        className={input}
                        value={language}
                        onChange={e => setLanguage(e.target.value as "pt" | "en" | "es")}
                    >
                        <option value="pt">Português</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                    </select>
                </label>
                <p className="text-xs text-stone-500">Preferência salva neste navegador.</p>
            </section>

            <SupportContact />
        </div>
    );
};
