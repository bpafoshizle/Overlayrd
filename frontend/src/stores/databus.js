import { defineStore } from 'pinia'

export const useDatabus = defineStore('databus', {
    state: () => ({
        positioningSelectedEvent: null,
    }),
    getters: {
        getPositioningSelectedEvent(state) {
            return state.positioningSelectedEvent
        }
    },
    actions: {
        setPositioningSelectedEvent(event) {
            this.positioningSelectedEvent = event
        }
    }
})