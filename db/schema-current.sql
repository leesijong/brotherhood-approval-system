--
-- PostgreSQL database dump
--

\restrict o4o59aZnZfwyFC7dixmjaDM8gmzlaMiZtz3M4TfkWrVz52Ld1ZqdhEVeLEA2SC5

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: approval_histories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approval_histories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    document_id uuid NOT NULL,
    approval_step_id uuid NOT NULL,
    approver_id uuid NOT NULL,
    action character varying(20) NOT NULL,
    comment text,
    delegated_to uuid,
    action_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    ip_address inet,
    user_agent text
);


ALTER TABLE public.approval_histories OWNER TO postgres;

--
-- Name: approval_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approval_lines (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    document_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_parallel boolean DEFAULT false,
    is_conditional boolean DEFAULT false,
    condition_expression text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.approval_lines OWNER TO postgres;

--
-- Name: approval_steps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approval_steps (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    approval_line_id uuid NOT NULL,
    step_order integer NOT NULL,
    approver_id uuid NOT NULL,
    approver_type character varying(20) DEFAULT 'PERSON'::character varying NOT NULL,
    is_required boolean DEFAULT true,
    is_delegatable boolean DEFAULT true,
    max_delegation_level integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    alternate_approver_id uuid,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    is_conditional boolean DEFAULT false,
    condition_expression text,
    comments text,
    approved_at timestamp with time zone,
    rejected_at timestamp with time zone,
    delegated_at timestamp with time zone,
    due_date date
);


ALTER TABLE public.approval_steps OWNER TO postgres;

--
-- Name: attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attachments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    document_id uuid NOT NULL,
    filename character varying(255) NOT NULL,
    original_filename character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size bigint NOT NULL,
    mime_type character varying(100) NOT NULL,
    checksum character varying(64) NOT NULL,
    uploaded_by uuid NOT NULL,
    uploaded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_encrypted boolean DEFAULT false,
    encryption_key_id character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    description text,
    stored_filename character varying(255) DEFAULT 'temp_filename.tmp'::character varying NOT NULL
);


ALTER TABLE public.attachments OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    action character varying(50) NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_id character varying(255) NOT NULL,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    action_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    error_message text,
    session_id character varying(255),
    is_successful boolean
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(20) NOT NULL,
    address text,
    phone character varying(20),
    email character varying(100),
    parent_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    document_id uuid NOT NULL,
    author_id uuid NOT NULL,
    content text NOT NULL,
    parent_comment_id uuid,
    is_internal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_edited boolean DEFAULT false
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title character varying(200) NOT NULL,
    content text,
    document_type character varying(50) NOT NULL,
    security_level character varying(20) DEFAULT 'GENERAL'::character varying NOT NULL,
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    priority character varying(20) DEFAULT 'NORMAL'::character varying NOT NULL,
    author_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    parent_document_id uuid,
    version integer DEFAULT 1,
    is_final boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    submitted_at timestamp with time zone,
    approved_at timestamp with time zone,
    document_number character varying(50),
    rejected_at timestamp with time zone,
    rejection_reason text,
    due_date timestamp without time zone
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.policies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    policy_type character varying(50) NOT NULL,
    policy_data jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.policies OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    is_system_role boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    granted_by uuid,
    granted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    baptismal_name character varying(50) NOT NULL,
    phone character varying(20),
    branch_id uuid NOT NULL,
    is_active boolean DEFAULT true,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    name character varying(100) NOT NULL,
    login_id character varying(50) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: approval_histories approval_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_histories
    ADD CONSTRAINT approval_histories_pkey PRIMARY KEY (id);


--
-- Name: approval_lines approval_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_lines
    ADD CONSTRAINT approval_lines_pkey PRIMARY KEY (id);


--
-- Name: approval_steps approval_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_steps
    ADD CONSTRAINT approval_steps_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: branches branches_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_code_key UNIQUE (code);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: documents documents_document_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_document_number_key UNIQUE (document_number);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: policies policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_id_branch_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_id_branch_id_key UNIQUE (user_id, role_id, branch_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_login_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_id_key UNIQUE (login_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_approval_histories_approver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_approval_histories_approver_id ON public.approval_histories USING btree (approver_id);


--
-- Name: idx_approval_histories_document_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_approval_histories_document_id ON public.approval_histories USING btree (document_id);


--
-- Name: idx_approval_lines_document_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_approval_lines_document_id ON public.approval_lines USING btree (document_id);


--
-- Name: idx_approval_steps_alternate_approver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_approval_steps_alternate_approver_id ON public.approval_steps USING btree (alternate_approver_id);


--
-- Name: idx_approval_steps_approval_line_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_approval_steps_approval_line_id ON public.approval_steps USING btree (approval_line_id);


--
-- Name: idx_approval_steps_approver_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_approval_steps_approver_id ON public.approval_steps USING btree (approver_id);


--
-- Name: idx_approval_steps_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_approval_steps_status ON public.approval_steps USING btree (status);


--
-- Name: idx_attachments_document_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attachments_document_id ON public.attachments USING btree (document_id);


--
-- Name: idx_audit_logs_action_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_action_at ON public.audit_logs USING btree (action_at);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_logs_resource; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_resource ON public.audit_logs USING btree (resource_type, resource_id);


--
-- Name: idx_audit_logs_resource_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs USING btree (resource_type);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_comments_document_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_comments_document_id ON public.comments USING btree (document_id);


--
-- Name: idx_documents_author_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_author_id ON public.documents USING btree (author_id);


--
-- Name: idx_documents_branch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_branch_id ON public.documents USING btree (branch_id);


--
-- Name: idx_documents_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_created_at ON public.documents USING btree (created_at);


--
-- Name: idx_documents_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_documents_status ON public.documents USING btree (status);


--
-- Name: idx_users_branch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_branch_id ON public.users USING btree (branch_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_login_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_login_id ON public.users USING btree (login_id);


--
-- Name: idx_users_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_name ON public.users USING btree (name);


--
-- Name: approval_lines update_approval_lines_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_approval_lines_updated_at BEFORE UPDATE ON public.approval_lines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: branches update_branches_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: comments update_comments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: documents update_documents_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: policies update_policies_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: roles update_roles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: approval_histories approval_histories_approval_step_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_histories
    ADD CONSTRAINT approval_histories_approval_step_id_fkey FOREIGN KEY (approval_step_id) REFERENCES public.approval_steps(id);


--
-- Name: approval_histories approval_histories_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_histories
    ADD CONSTRAINT approval_histories_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(id);


--
-- Name: approval_histories approval_histories_delegated_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_histories
    ADD CONSTRAINT approval_histories_delegated_to_fkey FOREIGN KEY (delegated_to) REFERENCES public.users(id);


--
-- Name: approval_histories approval_histories_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_histories
    ADD CONSTRAINT approval_histories_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: approval_lines approval_lines_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_lines
    ADD CONSTRAINT approval_lines_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: approval_lines approval_lines_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_lines
    ADD CONSTRAINT approval_lines_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: approval_steps approval_steps_alternate_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_steps
    ADD CONSTRAINT approval_steps_alternate_approver_id_fkey FOREIGN KEY (alternate_approver_id) REFERENCES public.users(id);


--
-- Name: approval_steps approval_steps_approval_line_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_steps
    ADD CONSTRAINT approval_steps_approval_line_id_fkey FOREIGN KEY (approval_line_id) REFERENCES public.approval_lines(id) ON DELETE CASCADE;


--
-- Name: approval_steps approval_steps_approver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_steps
    ADD CONSTRAINT approval_steps_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.users(id);


--
-- Name: attachments attachments_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: attachments attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: branches branches_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.branches(id);


--
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: comments comments_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: comments comments_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id);


--
-- Name: documents documents_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: documents documents_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: documents documents_parent_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_parent_document_id_fkey FOREIGN KEY (parent_document_id) REFERENCES public.documents(id);


--
-- Name: policies policies_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: user_roles user_roles_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: user_roles user_roles_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.users(id);


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: approval_histories Allow all for development; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all for development" ON public.approval_histories;


--
-- Name: approval_lines Allow all for development; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all for development" ON public.approval_lines;


--
-- Name: approval_steps Allow all for development; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all for development" ON public.approval_steps;


--
-- Name: attachments Allow all for development; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all for development" ON public.attachments;


--
-- Name: audit_logs Allow all for development; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all for development" ON public.audit_logs;


--
-- Name: branches Allow all for development; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all for development" ON public.branches;


--
-- Name: comments Allow all for development; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all for development" ON public.comments;


--
-- Name: documents Allow all for development; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all for development" ON public.documents;


--
-- Name: policies Allow all for development; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all for development" ON public.policies;


--
-- Name: users Allow all for development; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow all for development" ON public.users;


--
-- Name: approval_histories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.approval_histories ENABLE ROW LEVEL SECURITY;

--
-- Name: approval_lines; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.approval_lines ENABLE ROW LEVEL SECURITY;

--
-- Name: approval_steps; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.approval_steps ENABLE ROW LEVEL SECURITY;

--
-- Name: attachments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: branches; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

--
-- Name: comments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: policies; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict o4o59aZnZfwyFC7dixmjaDM8gmzlaMiZtz3M4TfkWrVz52Ld1ZqdhEVeLEA2SC5

