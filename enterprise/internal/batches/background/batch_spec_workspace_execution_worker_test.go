	"github.com/keegancsmith/sqlf"
	db := dbtest.NewDB(t, "")
	if err := s.CreateBatchSpecWorkspaceExecutionJob(ctx, job); err != nil {
	// Add a log entry that contains the changeset spec IDs
		Out:        `stdout: {"operation":"UPLOADING_CHANGESET_SPECS","timestamp":"2021-09-09T13:20:32.95Z","status":"SUCCESS","metadata":{"ids":` + jsonArray + `}} `,
		if err := s.Exec(ctx, sqlf.Sprintf("UPDATE batch_spec_workspace_execution_jobs SET worker_hostname = %s, state = %s WHERE id = %s", job.WorkerHostname, job.State, job.ID)); err != nil {
			t.Fatal(err)
		}
		entries     []workerutil.ExecutionLogEntry
			entries: []workerutil.ExecutionLogEntry{
				{Key: "setup.firecracker.start"},
				// Reduced log output because we don't care about _all_ lines
					Key: "step.src.0",
					Out: `
stdout: {"operation":"EXECUTING_TASKS","timestamp":"2021-09-09T13:20:32.942Z","status":"SUCCESS"}
stdout: {"operation":"UPLOADING_CHANGESET_SPECS","timestamp":"2021-09-09T13:20:32.942Z","status":"STARTED","metadata":{"total":1}}
stdout: {"operation":"UPLOADING_CHANGESET_SPECS","timestamp":"2021-09-09T13:20:32.95Z","status":"PROGRESS","metadata":{"done":1,"total":1}}
stdout: {"operation":"UPLOADING_CHANGESET_SPECS","timestamp":"2021-09-09T13:20:32.95Z","status":"SUCCESS","metadata":{"ids":["Q2hhbmdlc2V0U3BlYzoiNkxIYWN5dkI3WDYi"]}}

`,
			// Run `echo "QmF0Y2hTcGVjOiJBZFBMTDU5SXJmWCI=" | base64 -d` to get this

			name:    "no step.src.0 log entry",
			entries: []workerutil.ExecutionLogEntry{},
			wantErr: ErrNoChangesetSpecIDs,
		},

		{

			name: "no upload step in the output",
			entries: []workerutil.ExecutionLogEntry{
					Key: "step.src.0",
					Out: `stdout: {"operation":"PARSING_BATCH_SPEC","timestamp":"2021-07-06T09:38:51.481Z","status":"STARTED"}
stdout: {"operation":"PARSING_BATCH_SPEC","timestamp":"2021-07-06T09:38:51.481Z","status":"SUCCESS"}
`,
		{
			name: "empty array the output",
			entries: []workerutil.ExecutionLogEntry{
				{
					Key: "step.src.0",
					Out: `
stdout: {"operation":"EXECUTING_TASKS","timestamp":"2021-09-09T13:20:32.942Z","status":"SUCCESS"}
stdout: {"operation":"UPLOADING_CHANGESET_SPECS","timestamp":"2021-09-09T13:20:32.942Z","status":"STARTED","metadata":{"total":1}}
stdout: {"operation":"UPLOADING_CHANGESET_SPECS","timestamp":"2021-09-09T13:20:32.95Z","status":"PROGRESS","metadata":{"done":1,"total":1}}
stdout: {"operation":"UPLOADING_CHANGESET_SPECS","timestamp":"2021-09-09T13:20:32.95Z","status":"SUCCESS","metadata":{"ids":[]}}

`,
				},
			},
			wantErr: ErrNoChangesetSpecIDs,
		},

		{
			name: "additional text in log output",
			entries: []workerutil.ExecutionLogEntry{
				{
					Key: "step.src.0",
					Out: `stdout: {"operation":"EXECUTING_TASKS","timestamp":"2021-09-09T13:20:32.941Z","status":"STARTED","metadata":{"tasks":[]}}
stdout: {"operation":"EXECUTING_TASKS","timestamp":"2021-09-09T13:20:32.942Z","status":"SUCCESS"}
stderr: HORSE
stdout: {"operation":"UPLOADING_CHANGESET_SPECS","timestamp":"2021-09-09T13:20:32.942Z","status":"STARTED","metadata":{"total":1}}
stderr: HORSE
stdout: {"operation":"UPLOADING_CHANGESET_SPECS","timestamp":"2021-09-09T13:20:32.95Z","status":"PROGRESS","metadata":{"done":1,"total":1}}
stderr: HORSE
stdout: {"operation":"UPLOADING_CHANGESET_SPECS","timestamp":"2021-09-09T13:20:32.95Z","status":"SUCCESS","metadata":{"ids":["Q2hhbmdlc2V0U3BlYzoiNkxIYWN5dkI3WDYi"]}}
`,
				},
			},
			wantRandIDs: []string{"6LHacyvB7X6"},
		},

		{
			name: "invalid json",
			entries: []workerutil.ExecutionLogEntry{
				{
					Key: "step.src.0",
					Out: `stdout: {"operation":"PARSING_BATCH_SPEC","timestamp":"2021-07-06T09:38:51.481Z","status":"STARTED"}
stdout: {HOOOORSE}
stdout: {HORSE}
stdout: {HORSE}
`,
				},
			},
			wantErr: ErrNoChangesetSpecIDs,
		},

		{
			name: "non-json output inbetween valid json",
			entries: []workerutil.ExecutionLogEntry{
				{
					Key: "step.src.0",
					Out: `stdout: {"operation":"PARSING_BATCH_SPEC","timestamp":"2021-07-12T12:25:33.965Z","status":"STARTED"}
stdout: No changeset specs created
stdout: {"operation":"UPLOADING_CHANGESET_SPECS","timestamp":"2021-09-09T13:20:32.95Z","status":"SUCCESS","metadata":{"ids":["Q2hhbmdlc2V0U3BlYzoiNkxIYWN5dkI3WDYi"]}}`,
				},
			},
			wantRandIDs: []string{"6LHacyvB7X6"},
		},
			have, err := extractChangesetSpecRandIDs(tt.entries)