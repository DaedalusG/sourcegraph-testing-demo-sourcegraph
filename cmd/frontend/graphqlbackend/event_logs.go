package graphqlbackend

import (
	"context"

	"github.com/sourcegraph/sourcegraph/cmd/frontend/backend"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/envvar"
	"github.com/sourcegraph/sourcegraph/cmd/frontend/graphqlbackend/graphqlutil"
	"github.com/sourcegraph/sourcegraph/internal/database"
)

type eventLogsArgs struct {
	graphqlutil.ConnectionArgs
	EventName *string // return only event logs matching the event name
	Source *string // return only event logs matching the event source
}

func (r *UserResolver) EventLogs(ctx context.Context, args *eventLogsArgs) (*userEventLogsConnectionResolver, error) {
	// 🚨 SECURITY: Only the authenticated user can view their event logs on
	// Sourcegraph.com.
	if envvar.SourcegraphDotComMode() {
		if err := backend.CheckSameUser(ctx, r.user.ID); err != nil {
			return nil, err
		}
	} else {
		// 🚨 SECURITY: Only the authenticated user and site admins can view users'
		// event logs.
		if err := backend.CheckSiteAdminOrSameUser(ctx, r.db, r.user.ID); err != nil {
			return nil, err
		}
	}

	var opt database.EventLogsListOptions
	args.ConnectionArgs.Set(&opt.LimitOffset)
	opt.UserID = r.user.ID
	opt.EventName = args.EventName
	opt.Source = args.Source
	return &userEventLogsConnectionResolver{db: r.db, opt: opt}, nil
}

type userEventLogsConnectionResolver struct {
	db  database.DB
	opt database.EventLogsListOptions
}

func (r *userEventLogsConnectionResolver) Nodes(ctx context.Context) ([]*userEventLogResolver, error) {
	events, err := r.db.EventLogs().ListAll(ctx, r.opt)
	if err != nil {
		return nil, err
	}

	eventLogs := make([]*userEventLogResolver, 0, len(events))
	for _, event := range events {
		eventLogs = append(eventLogs, &userEventLogResolver{db: r.db, event: event})
	}

	return eventLogs, nil
}

func (r *userEventLogsConnectionResolver) TotalCount(ctx context.Context) (int32, error) {
	var count int
	var err error

	count, err = r.db.EventLogs().CountAll(ctx, r.opt)

	return int32(count), err
}

func (r *userEventLogsConnectionResolver) PageInfo(ctx context.Context) (*graphqlutil.PageInfo, error) {
	var count int
	var err error

	count, err = r.db.EventLogs().CountAll(ctx, r.opt)

	if err != nil {
		return nil, err
	}
	return graphqlutil.HasNextPage(r.opt.LimitOffset != nil && count > r.opt.Limit), nil
}
