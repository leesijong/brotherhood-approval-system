--
-- PostgreSQL database dump
--

\restrict 7fKUhdBrhv1rBJjcZgG7dqcdIovtvlWKdIOt6pieUnno9S31cbIcMguKamrAKaX

-- Dumped from database version 17.6 (Debian 17.6-2.pgdg13+1)
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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: approval_histories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approval_histories (
    id uuid NOT NULL,
    action character varying(20) NOT NULL,
    action_at timestamp(6) without time zone NOT NULL,
    comment text,
    ip_address character varying(50),
    user_agent text,
    approval_step_id uuid NOT NULL,
    approver_id uuid NOT NULL,
    delegated_to uuid,
    document_id uuid NOT NULL
);


ALTER TABLE public.approval_histories OWNER TO postgres;

--
-- Name: approval_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approval_lines (
    id uuid NOT NULL,
    condition_expression text,
    created_at timestamp(6) without time zone NOT NULL,
    description character varying(255),
    is_conditional boolean NOT NULL,
    is_parallel boolean NOT NULL,
    name character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    created_by uuid NOT NULL,
    document_id uuid NOT NULL
);


ALTER TABLE public.approval_lines OWNER TO postgres;

--
-- Name: approval_steps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.approval_steps (
    id uuid NOT NULL,
    approved_at timestamp(6) without time zone,
    approver_type character varying(20) NOT NULL,
    comments text,
    condition_expression text,
    created_at timestamp(6) without time zone NOT NULL,
    delegated_at timestamp(6) without time zone,
    due_date date,
    is_conditional boolean NOT NULL,
    is_delegatable boolean NOT NULL,
    is_required boolean NOT NULL,
    max_delegation_level integer NOT NULL,
    rejected_at timestamp(6) without time zone,
    status character varying(20),
    step_order integer NOT NULL,
    alternate_approver_id uuid,
    approval_line_id uuid NOT NULL,
    approver_id uuid NOT NULL
);


ALTER TABLE public.approval_steps OWNER TO postgres;

--
-- Name: attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attachments (
    id uuid NOT NULL,
    checksum character varying(64) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    encryption_key_id character varying(100),
    file_path character varying(500) NOT NULL,
    file_size bigint NOT NULL,
    filename character varying(255) NOT NULL,
    is_encrypted boolean NOT NULL,
    mime_type character varying(100) NOT NULL,
    original_filename character varying(255) NOT NULL,
    stored_filename character varying(255) NOT NULL,
    uploaded_at timestamp(6) without time zone NOT NULL,
    document_id uuid NOT NULL,
    uploaded_by uuid NOT NULL
);


ALTER TABLE public.attachments OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    action character varying(50) NOT NULL,
    action_at timestamp(6) without time zone NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    error_message text,
    ip_address character varying(50),
    is_successful boolean,
    new_values text,
    old_values text,
    resource_id uuid NOT NULL,
    resource_type character varying(50) NOT NULL,
    session_id character varying(255),
    user_agent text,
    user_id uuid
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id uuid NOT NULL,
    address character varying(255),
    code character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    email character varying(255),
    is_active boolean NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(255),
    updated_at timestamp(6) without time zone
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    is_edited boolean NOT NULL,
    is_internal boolean NOT NULL,
    updated_at timestamp(6) without time zone,
    author_id uuid NOT NULL,
    document_id uuid NOT NULL,
    parent_comment_id uuid
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id uuid NOT NULL,
    approved_at timestamp(6) without time zone,
    content text,
    created_at timestamp(6) without time zone NOT NULL,
    document_number character varying(50),
    document_type character varying(50) NOT NULL,
    due_date timestamp(6) without time zone,
    is_final boolean NOT NULL,
    priority character varying(20) NOT NULL,
    rejected_at timestamp(6) without time zone,
    rejection_reason text,
    security_level character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    submitted_at timestamp(6) without time zone,
    title character varying(200) NOT NULL,
    updated_at timestamp(6) without time zone,
    version integer NOT NULL,
    author_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    parent_document_id uuid
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id character varying(255) NOT NULL,
    action_url character varying(255),
    created_at timestamp(6) without time zone NOT NULL,
    is_read boolean NOT NULL,
    message text NOT NULL,
    priority character varying(20) NOT NULL,
    read_at timestamp(6) without time zone,
    title character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    document_id uuid,
    user_id uuid NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.policies (
    id character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description text,
    is_active boolean NOT NULL,
    name character varying(255) NOT NULL,
    policy_data text NOT NULL,
    policy_type character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    created_by uuid NOT NULL
);


ALTER TABLE public.policies OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description character varying(255),
    is_active boolean NOT NULL,
    name character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id uuid NOT NULL,
    expires_at timestamp(6) without time zone,
    granted_at timestamp(6) without time zone NOT NULL,
    is_active boolean NOT NULL,
    branch_id uuid NOT NULL,
    granted_by uuid,
    role_id uuid NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    baptismal_name character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    email character varying(255) NOT NULL,
    is_active boolean NOT NULL,
    last_login_at timestamp(6) without time zone,
    login_id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    phone character varying(255),
    updated_at timestamp(6) without time zone,
    branch_id uuid NOT NULL
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
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: policies policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: users uk_6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: documents uk_7pbljc8fr900j7wbeti1fkmka; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT uk_7pbljc8fr900j7wbeti1fkmka UNIQUE (document_number);


--
-- Name: users uk_i3xs7wmfu2i3jt079uuetycit; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_i3xs7wmfu2i3jt079uuetycit UNIQUE (login_id);


--
-- Name: roles uk_ofx66keruapi6vyqpv6f2or37; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT uk_ofx66keruapi6vyqpv6f2or37 UNIQUE (name);


--
-- Name: branches uk_rt29b5cpquhexus5t5ywalg67; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT uk_rt29b5cpquhexus5t5ywalg67 UNIQUE (code);


--
-- Name: user_roles ukhqq5b5bwks69otdp2abpjemjt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT ukhqq5b5bwks69otdp2abpjemjt UNIQUE (user_id, role_id, branch_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: user_roles fk1kcy7vm1lc9xxuttv2q8bdioe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fk1kcy7vm1lc9xxuttv2q8bdioe FOREIGN KEY (granted_by) REFERENCES public.users(id);


--
-- Name: documents fk60dm4aap7dopqi9s25b69lhin; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fk60dm4aap7dopqi9s25b69lhin FOREIGN KEY (parent_document_id) REFERENCES public.documents(id);


--
-- Name: approval_histories fk6txlk3dyxx7imka59p9cy8tx3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_histories
    ADD CONSTRAINT fk6txlk3dyxx7imka59p9cy8tx3 FOREIGN KEY (delegated_to) REFERENCES public.users(id);


--
-- Name: comments fk7h839m3lkvhbyv3bcdv7sm4fj; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk7h839m3lkvhbyv3bcdv7sm4fj FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id);


--
-- Name: approval_histories fk8rsdjp5io39o7fvr4w9plbtih; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_histories
    ADD CONSTRAINT fk8rsdjp5io39o7fvr4w9plbtih FOREIGN KEY (approval_step_id) REFERENCES public.approval_steps(id);


--
-- Name: users fk9o70sp9ku40077y38fk4wieyk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk9o70sp9ku40077y38fk4wieyk FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: notifications fk9y21adhxn0ayjhfocscqox7bh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk9y21adhxn0ayjhfocscqox7bh FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: comments fkccw7klbfv0lkycbtfxa53sqja; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fkccw7klbfv0lkycbtfxa53sqja FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: policies fkgkptap8j7yvhm36dtqs6mgiuc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT fkgkptap8j7yvhm36dtqs6mgiuc FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: approval_histories fkgvrwlhk2bylo4a763rwpemcth; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_histories
    ADD CONSTRAINT fkgvrwlhk2bylo4a763rwpemcth FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: user_roles fkh8ciramu9cc9q3qcqiv4ue8a6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fkh8ciramu9cc9q3qcqiv4ue8a6 FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: user_roles fkhfh9dx7w3ubf1co1vdev94g3f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fkhfh9dx7w3ubf1co1vdev94g3f FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications fkhsc5tpqfcr6dv395ppj6a2h60; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fkhsc5tpqfcr6dv395ppj6a2h60 FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: approval_histories fki31f93kkukfign2c14ka74kt4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_histories
    ADD CONSTRAINT fki31f93kkukfign2c14ka74kt4 FOREIGN KEY (approver_id) REFERENCES public.users(id);


--
-- Name: approval_steps fki31gvjt7fialtlcl5ncvjla7t; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_steps
    ADD CONSTRAINT fki31gvjt7fialtlcl5ncvjla7t FOREIGN KEY (approver_id) REFERENCES public.users(id);


--
-- Name: documents fkj4uc6es79q2n1ki2vopigfs37; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fkj4uc6es79q2n1ki2vopigfs37 FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: audit_logs fkjs4iimve3y0xssbtve5ysyef0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT fkjs4iimve3y0xssbtve5ysyef0 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: approval_lines fkk9k9h7x1f6bwqn7iwe8bx8x7r; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_lines
    ADD CONSTRAINT fkk9k9h7x1f6bwqn7iwe8bx8x7r FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: attachments fkl3qeaqe1mykgrd4ltgmqthdkp; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT fkl3qeaqe1mykgrd4ltgmqthdkp FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: approval_steps fkmd9bs7mxmn9m8lw3vjy8ip08v; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_steps
    ADD CONSTRAINT fkmd9bs7mxmn9m8lw3vjy8ip08v FOREIGN KEY (alternate_approver_id) REFERENCES public.users(id);


--
-- Name: comments fkn2na60ukhs76ibtpt9burkm27; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fkn2na60ukhs76ibtpt9burkm27 FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: user_roles fkn71s1ys1nx94y9o03rk7lvea6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT fkn71s1ys1nx94y9o03rk7lvea6 FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: approval_lines fkno20jgtqx0rv2kehu31bfcjys; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_lines
    ADD CONSTRAINT fkno20jgtqx0rv2kehu31bfcjys FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: attachments fknpgwrxogx4rj1pynob5vd0n2d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT fknpgwrxogx4rj1pynob5vd0n2d FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: documents fkouq4c7m9dkafopniieriedyxh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fkouq4c7m9dkafopniieriedyxh FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: approval_steps fksowiikqm55xk4iuh58b9yhoae; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.approval_steps
    ADD CONSTRAINT fksowiikqm55xk4iuh58b9yhoae FOREIGN KEY (approval_line_id) REFERENCES public.approval_lines(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 7fKUhdBrhv1rBJjcZgG7dqcdIovtvlWKdIOt6pieUnno9S31cbIcMguKamrAKaX

