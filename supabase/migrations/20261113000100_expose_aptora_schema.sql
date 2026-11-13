-- Keep the Aptora schema reachable through PostgREST while retaining the
-- narrow table and routine grants defined by the initial migration.
alter role authenticator set pgrst.db_schemas = 'public, graphql_public, aptora';
notify pgrst, 'reload config';
