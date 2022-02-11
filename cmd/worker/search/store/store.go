package store

import (
	"context"
	"database/sql"

	"github.com/sourcegraph/sourcegraph/internal/database"
	"github.com/sourcegraph/sourcegraph/internal/database/basestore"
	"github.com/sourcegraph/sourcegraph/internal/metrics"
	"github.com/sourcegraph/sourcegraph/internal/observation"
)

type Store struct {
	*basestore.Store
	operations *Operations
}

func NewWithDB(db database.DB, observationContext *observation.Context, metrics *metrics.REDMetrics) *Store {
	if metrics == nil {
		metrics = NewREDMetrics(observationContext)
	}

	return &Store{
		Store:      basestore.NewWithDB(db, sql.TxOptions{}),
		operations: NewOperations(observationContext, metrics),
	}
}

func (s *Store) With(other basestore.ShareableStore) *Store {
	return &Store{
		Store:      s.Store.With(other),
		operations: s.operations,
	}
}

func (s *Store) Transact(ctx context.Context) (*Store, error) {
	txBase, err := s.Store.Transact(ctx)
	if err != nil {
		return nil, err
	}

	return &Store{
		Store:      txBase,
		operations: s.operations,
	}, nil
}