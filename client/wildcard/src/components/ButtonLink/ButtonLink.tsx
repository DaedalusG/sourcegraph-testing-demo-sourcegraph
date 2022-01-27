import classNames from 'classnames'
import * as H from 'history'
import { noop } from 'lodash'
import React, { AnchorHTMLAttributes } from 'react'
import { Key } from 'ts-key-enum'

import { isDefined } from '@sourcegraph/common'

import { Button, ButtonProps } from '../Button'
import { RouterLink, AnchorLink } from '../Link'

const isSelectKeyPress = (event: React.KeyboardEvent): boolean =>
    event.key === Key.Enter && !event.ctrlKey && !event.shiftKey && !event.metaKey && !event.altKey

export type ButtonLinkProps = Omit<ButtonProps, 'as'> &
    AnchorHTMLAttributes<HTMLAnchorElement> & {
        /** The link destination URL. */
        to?: H.LocationDescriptor

        /**
         * Called when the user clicks or presses enter on this element.
         */
        onSelect?: (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void

        /** A tooltip to display when the user hovers or focuses this element. */
        ['data-tooltip']?: string

        /**
         * If given, the element is treated as a toggle with the boolean indicating its state.
         * Applies `aria-pressed`.
         */
        pressed?: boolean

        disabledClassName?: string

        ['data-content']?: string

        id?: string

        disabled?: boolean

        /** Override default tab index */
        tabIndex?: number
    }

/**
 * A component that is displayed in the same way, regardless of whether it's a link (with a
 * destination URL) or a button (with a click handler).
 *
 * It is keyboard accessible: unlike `<Link>` or `<a>`, pressing the enter key triggers it.
 */
export const ButtonLink: React.FunctionComponent<ButtonLinkProps> = React.forwardRef(
    (
        {
            className,
            to,
            target,
            rel,
            disabled,
            disabledClassName,
            pressed,
            'data-tooltip': tooltip,
            onSelect = noop,
            children,
            id,
            'data-content': dataContent,
            tabIndex,
            ...rest
        },
        reference
    ) => {
        // We need to set up a keypress listener because <a onclick> doesn't get
        // triggered by enter.
        const handleKeyPress: React.KeyboardEventHandler<HTMLElement> = event => {
            if (!disabled && isSelectKeyPress(event)) {
                onSelect(event)
            }
        }

        const handleClick: React.MouseEventHandler<HTMLElement> = event => {
            // Prevent default action of reloading page because of empty href
            event.preventDefault()

            if (disabled) {
                return false
            }

            return onSelect(event)
        }

        const commonProps = {
            // `.disabled` will only be selected if the `.btn` class is applied as well
            className: classNames(className, disabled && ['disabled', disabledClassName]),
            'data-tooltip': tooltip,
            'aria-label': tooltip,
            role: typeof pressed === 'boolean' ? 'button' : undefined,
            'aria-pressed': pressed,
            tabIndex: isDefined(tabIndex) ? tabIndex : disabled ? -1 : 0,
            onClick: onSelect,
            onKeyPress: handleKeyPress,
            id,
            ref: reference,
            disabled,
        }

        if (!to || disabled) {
            return (
                <Button
                    {...commonProps}
                    as={AnchorLink}
                    to=""
                    onClick={handleClick}
                    onAuxClick={handleClick}
                    role="button"
                    {...rest}
                >
                    {children}
                </Button>
            )
        }

        return (
            <Button {...commonProps} as={RouterLink} to={to} {...rest}>
                {children}
            </Button>
        )
    }
)