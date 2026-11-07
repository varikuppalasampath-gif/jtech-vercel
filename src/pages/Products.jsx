import PageHead from '../components/PageHead.jsx'
import CardGrid from '../components/CardGrid.jsx'
import { PRODUCTS } from '../constants.js'

export default function Products({ setTopic }) {
  return (
    <>
      <PageHead title="Products" text="Control, monitoring and embedded hardware designed and built by Jtech." />
      <section className="sec">
        <div className="wrap">
          <CardGrid items={PRODUCTS} setTopic={setTopic} cta="Request specifications" />
          <p className="lead">Models and detailed specifications are shared on request.</p>
        </div>
      </section>
    </>
  )
}

