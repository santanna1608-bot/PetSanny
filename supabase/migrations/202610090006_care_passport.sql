BEGIN;
CREATE TABLE public.pet_care_profiles(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES public.tenants(id),pet_id uuid NOT NULL,
 grooming_preferences text NOT NULL DEFAULT '' CHECK(length(grooming_preferences)<=2000),
 products_used text NOT NULL DEFAULT '' CHECK(length(products_used)<=2000),
 behavior_observed text NOT NULL DEFAULT '' CHECK(length(behavior_observed)<=2000),
 restrictions text NOT NULL DEFAULT '' CHECK(length(restrictions)<=2000),
 information_source text NOT NULL CHECK(information_source IN('tutor','professional')),
 recorded_by text NOT NULL CHECK(length(btrim(recorded_by)) BETWEEN 2 AND 255),
 next_return_date date,updated_at timestamptz NOT NULL DEFAULT now(),created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(tenant_id,pet_id), FOREIGN KEY(tenant_id,pet_id) REFERENCES public.pets(tenant_id,id)
);
ALTER TABLE public.pet_care_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pet_care_profiles FROM PUBLIC,anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.pet_care_profiles TO authenticated;
GRANT ALL ON public.pet_care_profiles TO service_role;
CREATE POLICY care_read ON public.pet_care_profiles FOR SELECT TO authenticated USING(private.has_tenant_access(tenant_id));
CREATE POLICY care_insert ON public.pet_care_profiles FOR INSERT TO authenticated WITH CHECK(private.has_tenant_access(tenant_id,true));
CREATE POLICY care_update ON public.pet_care_profiles FOR UPDATE TO authenticated USING(private.has_tenant_access(tenant_id,true)) WITH CHECK(private.has_tenant_access(tenant_id,true));
CREATE POLICY care_delete ON public.pet_care_profiles FOR DELETE TO authenticated USING(private.has_tenant_access(tenant_id,true));
CREATE FUNCTION private.stamp_care_profile() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$ BEGIN
 IF TG_OP='UPDATE' AND (NEW.tenant_id<>OLD.tenant_id OR NEW.pet_id<>OLD.pet_id) THEN RAISE EXCEPTION 'Vínculo do passaporte não pode mudar';END IF;
 NEW.updated_at:=now();RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.stamp_care_profile() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER stamp_care_profile BEFORE INSERT OR UPDATE ON public.pet_care_profiles FOR EACH ROW EXECUTE FUNCTION private.stamp_care_profile();
ALTER TABLE public.appointments ADD COLUMN care_stage text NOT NULL DEFAULT 'scheduled' CHECK(care_stage IN('scheduled','received','in_progress','ready','collected'));
INSERT INTO private.schema_migrations(version) VALUES('202610090006_care_passport');
COMMIT;
