import PageHead from '../components/PageHead.jsx'
import { About as AboutSection, Approach, Audience } from '../components/shared.jsx'

export default function About() {
  return (
    <>
      <PageHead title="About Us" text="An engineering team combining electronics, control and software." />
      <AboutSection />
      <Approach />
      <Audience />
    </>
  )
}

