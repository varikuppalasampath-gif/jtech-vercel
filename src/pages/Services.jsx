import PageHead from '../components/PageHead.jsx'
import CardGrid from '../components/CardGrid.jsx'
import { Approach } from '../components/shared.jsx'
import { SERVICE_LIST } from '../constants.js'

export default function Services({ setTopic }) {
  return (
    <>
      <PageHead title="Services" text="Engineering, integration, repair and support, from one team." />
      <section className="sec">
        <div className="wrap">
          <CardGrid items={SERVICE_LIST} setTopic={setTopic} />
        </div>
      </section>
      <Approach />
    </>
  )
}

