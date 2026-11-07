import PageHead from '../components/PageHead.jsx'
import { ContactSection } from '../components/shared.jsx'

export default function Contact({ topic, setTopic }) {
  return (
    <>
      <PageHead title="Contact Us" text="Request a quotation, a consultation or a technical discussion." />
      <ContactSection topic={topic} setTopic={setTopic} />
    </>
  )
}

