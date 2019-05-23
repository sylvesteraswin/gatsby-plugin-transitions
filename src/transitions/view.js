import React, { useState, useEffect } from 'react'
import { useStateContext } from './state'
import { useSpring, animated } from 'react-spring'

const TransitionView = ({ view, action, y, isKeep, skipEnterAnimation, skipLeaveAnimation }) => {
  const [{ prevLocation, mode, enter, usual, leave }, dispatch] = useStateContext()
  const [styles, setStyles] = useState(() => {
    if (mode === 'immediate') {
      return {
        position: 'fixed',
        transform: `translate3d(0,-${prevLocation && prevLocation.y[1]}px,0)`
      }
    }
    if (isKeep) {
      return { opacity: 0 }
    }
    return {}
  })
  const [props, set] = useSpring(() => {
    return skipEnterAnimation
      ? usual
      : enter
  })
  useEffect(() => {
    switch (action) {
      case 'enter':
        set({
          ...usual,
          onStart: () => {
            if (isKeep) {
              window.scrollTo(0, y)
            }
          },
          onRest: (props) => {
            if (isKeep) {
              dispatch({ type: 'REMOVE_KEEP' })
              setStyles({ opacity: 1 })
            }
            if (mode === 'immediate') {
              window.scrollTo(0, 0)
              setStyles({
                position: 'relative',
                transform: 'translate3d(0, 0px, 0)',
                willChange: ''
              })
            }
            if (typeof usual.onRest === 'function') usual.onRest(props)
            else if (typeof enter.onRest === 'function') enter.onRest(props)
            dispatch({ type: 'HAS_ENTERED' })
          }
        })
        break

      case 'leave':
        if (skipLeaveAnimation) {
          dispatch({ type: 'REMOVE_VIEW', locationKey: view.props.location.key })
          if (mode === 'successive') {
            window.scrollTo(0, 0)
            dispatch({ type: 'ADD_VIEW_FROM_QUEUE' })
          }
          return
        }
        set({
          ...leave,
          onRest: (props) => {
            dispatch({ type: 'REMOVE_VIEW', locationKey: view.props.location.key })
            if (mode === 'successive') {
              window.scrollTo(0, 0)
              dispatch({ type: 'ADD_VIEW_FROM_QUEUE' })
            }
            if (typeof leave.onRest === 'function') leave.onRest(props)
          }
        })
        break
    }
  }, [action])

  return (
    <div
      className='view-container'
      style={{
        width: '100%',
        gridArea: 'View',
        willChange: mode === 'immediate' && 'transform',
        gridTemplateAreas: 'View',
        top: 0,
        ...styles
      }}
    >
      <animated.div
        style={{
          width: '100%',
          willChange: `opacity${enter.transform || leave.transform ? ', transform' : ''}`,
          opacity: props.opacity,
          transform: props.transform
        }}
        className='view'>
        {view}
      </animated.div>
    </div>
  )
}

export default TransitionView
