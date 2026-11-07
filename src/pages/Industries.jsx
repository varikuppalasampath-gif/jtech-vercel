import PageHead from '../components/PageHead.jsx'
import { Audience } from '../components/shared.jsx'
import { INDUSTRIES, AUDIENCE } from '../constants.js'

export default function Industries() {
  return (
    <>
      <PageHead title="Industries" text="Where Jtech systems are applied." />
      <Audience title="Industries we work with" items={INDUSTRIES} />
      <Audience title="People we work with" items={AUDIENCE} />
    </>
  )
}

