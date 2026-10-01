-- ==============================================================================
-- Migration V2: AI Evaluation & Reliability Harness and Swarm Execution Tables
-- PostgreSQL with pgvector schema additions
-- ==============================================================================

-- 1. AI Evaluation Reports Table
CREATE TABLE IF NOT EXISTS evaluation_reports (
    id BIGSERIAL PRIMARY KEY,
    run_batch_id VARCHAR(64) NOT NULL,
    test_suite_name VARCHAR(120) NOT NULL,
    test_case_name VARCHAR(255) NOT NULL,
    endpoint_tested VARCHAR(150) NOT NULL,
    model_used VARCHAR(80) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PASSED',
    latency_ms BIGINT NOT NULL DEFAULT 0,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    grounding_score DOUBLE PRECISION DEFAULT 1.0,
    relevancy_score DOUBLE PRECISION DEFAULT 1.0,
    input_payload TEXT,
    output_payload TEXT,
    assertion_results TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_eval_batch_id ON evaluation_reports (run_batch_id);
CREATE INDEX IF NOT EXISTS idx_eval_suite_name ON evaluation_reports (test_suite_name);
CREATE INDEX IF NOT EXISTS idx_eval_status ON evaluation_reports (status);
CREATE INDEX IF NOT EXISTS idx_eval_created_at ON evaluation_reports (created_at DESC);

-- 2. Autonomous Multi-Agent Swarm Executions Table
CREATE TABLE IF NOT EXISTS swarm_executions (
    id BIGSERIAL PRIMARY KEY,
    task_key VARCHAR(50) NOT NULL,
    task_title VARCHAR(255) NOT NULL,
    priority VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    assigned_engineer VARCHAR(120),
    pm_rationale TEXT,
    suspected_file VARCHAR(255),
    root_cause_analysis TEXT,
    dispatched_channel VARCHAR(120),
    execution_time_ms BIGINT DEFAULT 0,
    step_logs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_swarm_task_key ON swarm_executions (task_key);
CREATE INDEX IF NOT EXISTS idx_swarm_created_at ON swarm_executions (created_at DESC);
