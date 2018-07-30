import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

import config from './firebase.conf'

firebase.initializeApp(config)

global.__fire = firebase

global.__host = window.location.search === '?host'

const db = firebase.database()
const hashRef = db.ref()

const watchFirebase = () =>
  hashRef.on('value', snap => {
    if (global.__host) return
    const hash = snap.val()
    if (hash) window.location.hash = hash
  })

// global.__host || watchFirebase()

import {When} from './when'
// When().changed((_, build) => global.__host && hashRef.set(build.id))